import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ArenasService } from '../arenas/arenas.service';
import { CourtSlot } from './entities/court-slot.entity';
import { Court } from '../courts/entities/court.entity';
import { CourtsService } from '../courts/courts.service';
import { CourtReservationSlotsDto } from '../reservations/dto/court-reservation-slots.dto';
import { CourtStatus } from '../courts/interfaces/court-status.interface';

@Injectable()
export class CourtSlotsService {
  constructor(
    @InjectRepository(CourtSlot)
    private readonly slotRepo: Repository<CourtSlot>,
    private readonly courtsService: CourtsService,

    private readonly arenasService: ArenasService,
  ) {}

  private validateAndFormatDate(date: string): string | never {
    // Step 0: validate date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    if (formattedDate > date) {
      return ApiResponseUtil.throwError(
        'errors.reservation.past_time',
        'INVALID_DATE',
        HttpStatus.BAD_REQUEST,
      );
    }
    return formattedDate;
  }

  async createSlots(
    courtReservationSlotsDto: CourtReservationSlotsDto[],
    reservation: Reservation,
    date: string,
    courts: Court[] = [],
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(CourtSlot) : this.slotRepo;

    const slots: CourtSlot[] = courtReservationSlotsDto
      .map(({ courtId, slots }) => {
        const court =
          courts.find((c) => c.id === courtId) ?? ({ id: courtId } as Court);
        return slots.map((hour) =>
          repo.create({
            court,
            reservation: { id: reservation.id } as Reservation,
            date,
            hour,
          }),
        );
      })
      .flat();
    return await repo.save(slots);
  }

  async getAvailableSlots(
    courtId: string,
    date: string,
  ): Promise<
    { courtId: string; date: string; availableHours: number[] } | never
  > {
    const formattedDate = this.validateAndFormatDate(date);

    // Step 1: find court
    const court = await this.courtsService.findOne(courtId);

    // Step 2: get all booked slots for that date
    const bookedSlots = await this.slotRepo.find({
      where: { court: { id: courtId }, date },
      select: ['hour'],
    });

    const bookedHours = bookedSlots.map((slot) => slot.hour);

    // Step 3: get arena to know opening and closing hours
    const arena = await this.arenasService.findOne(court.arena.id);
    // Step 3: generate all possible hours for this court
    const allHours: number[] = [];
    for (let h = arena.openingHour; h < arena.closingHour; h++) {
      allHours.push(h);
    }

    // Step 4: filter available ones
    let availableHours = allHours.filter((h) => !bookedHours.includes(h));

    // Step 5: filter out past hours if date is today
    if (formattedDate === date) {
      const currentHour = new Date().getHours();
      availableHours = availableHours.filter((h) => h >= currentHour);
    }

    return {
      courtId,
      date,
      availableHours,
    };
  }

  async getAvailableSlotsForArena(arenaId: string, date: string) {
    const formattedDate = this.validateAndFormatDate(date);
    const arena = await this.arenasService.findOne(arenaId);
    const courts = await this.courtsService.findByArena(
      arenaId,
      CourtStatus.ACTIVE,
    );
    const courtIds = courts.map((c) => c.id);
    const bookedSlots = await this.slotRepo.find({
      where: {
        court: { id: In(courtIds) },
        date: formattedDate,
      },
      relations: { court: true },
    });
    const bookedHoursByCourt: Record<string, number[]> = {};
    bookedSlots.forEach((slot) => {
      if (!bookedHoursByCourt[slot.court.id]) {
        bookedHoursByCourt[slot.court.id] = [];
      }
      bookedHoursByCourt[slot.court.id].push(slot.hour);
    });

    const result = courts.map((court) => {
      const bookedHours = bookedHoursByCourt[court.id] || [];
      const allHours: number[] = [];
      for (let h = arena.openingHour; h < arena.closingHour; h++) {
        allHours.push(h);
      }
      let availableHours = allHours.filter((h) => !bookedHours.includes(h));
      if (formattedDate === date) {
        const currentHour = new Date().getHours();
        availableHours = availableHours.filter((h) => h >= currentHour);
      }
      return {
        courtId: court.id,
        courtName: court.name,
        date,
        availableHours,
      };
    });

    return result;
  }

  async getBookedHoursGroupedByCourt(
    courtReservationSlotsDto: CourtReservationSlotsDto[],
    date: string,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(CourtSlot) : this.slotRepo;

    // 1. Map the DTOs into TypeORM where conditions
    const whereConditions = courtReservationSlotsDto.map(
      ({ courtId, slots }) => ({
        court: { id: courtId },
        date,
        hour: In(slots),
        cancelledAt: IsNull(),
      }),
    );

    // 2. Execute a single query with the array of conditions (joined by OR)
    const slotsBooked = await repo.find({
      where: whereConditions,
      select: {
        hour: true,
        court: { id: true },
      },
      relations: ['court'],
    });

    // 3. Extract and return the hours grouped by court
    const result: Record<string, number[]> = {};
    slotsBooked.forEach((slot) => {
      if (!result[slot.court.id]) {
        result[slot.court.id] = [];
      }
      result[slot.court.id].push(slot.hour);
    });
    return result;
  }

  async validateSlotsAreAvailable(
    courtReservationSlotsDto: CourtReservationSlotsDto[],
    date: string,
    manager?: EntityManager,
  ): Promise<void | never> {
    const bookedHours = await this.getBookedHoursGroupedByCourt(
      courtReservationSlotsDto,
      date,
      manager,
    );
    if (Object.values(bookedHours).some((hours) => hours.length > 0)) {
      return ApiResponseUtil.throwError(
        'errors.reservation.slots_already_booked',
        'SLOTS_ALREADY_BOOKED',
        HttpStatus.BAD_REQUEST,
        { bookedHours },
      );
    }
  }

  async cancelSlots(slots: CourtSlot[], manager?: EntityManager) {
    const repo = manager ? manager.getRepository(CourtSlot) : this.slotRepo;
    for (const slot of slots) {
      slot.cancelledAt = new Date();
    }
    return await repo.save(slots);
  }

  async getPopularBookingTimes(
    ownerId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    // Set default date range to last month to today if not provided
    if (!startDate) {
      const today = new Date();
      startDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDay(),
      );
    }
    if (!endDate) {
      const today = new Date();
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDay());
    }

    // Query to get popular booking times
    const result = await this.slotRepo
      .createQueryBuilder('slot')
      .innerJoin('slot.arena', 'arena')
      .where('arena.ownerId = :ownerId', { ownerId })
      .andWhere('slot.cancelledAt IS NULL')
      .andWhere('slot.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .select('slot.hour', 'hour')
      .addSelect('COUNT(slot.id)', 'bookingCount')
      .groupBy('slot.hour')
      .orderBy('COUNT(slot.id)', 'DESC')
      .getRawMany();

    return result;
  }
}
