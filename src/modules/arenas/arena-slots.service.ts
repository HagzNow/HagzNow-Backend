// arena-slots.service.ts

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { EntityManager, In, Repository } from 'typeorm';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ArenasService } from './arenas.service';
import { ArenaSlot } from './entities/arena-slot.entity';
import { Arena } from './entities/arena.entity';

@Injectable()
export class ArenaSlotsService {
  constructor(
    @InjectRepository(ArenaSlot)
    private readonly slotRepo: Repository<ArenaSlot>,

    @InjectRepository(Arena)
    private readonly arenaRepo: Repository<Arena>,

    private readonly arenasService: ArenasService,
  ) {}

  async createSlots(
    arena: Arena,
    reservation: Reservation,
    date: string,
    hours: number[],
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(ArenaSlot) : this.slotRepo;
    const slots: ArenaSlot[] = hours.map((hour) =>
      repo.create({
        arena,
        reservation,
        date,
        hour,
        isCanceled: false,
      }),
    );
    return await repo.save(slots);
  }

  async getAvailableSlots(arenaId: string, date: string) {
    // Step 0: validate date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    if (formattedDate > date) {
      return ApiResponseUtil.throwError(
        'You cannot check available slots for past dates',
        'INVALID_DATE',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Step 1: find arena
    const arena = await this.arenaRepo.findOne({ where: { id: arenaId } });
    //WORK
    if (!arena)
      return ApiResponseUtil.throwError(
        'Arena not found',
        'Arena_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );

    // Step 2: get all booked slots for that date
    const bookedSlots = await this.slotRepo.find({
      where: { arena: { id: arenaId }, date },
      select: ['hour'],
    });

    const bookedHours = bookedSlots.map((slot) => slot.hour);

    // Step 3: generate all possible hours for this arena
    const allHours: number[] = [];
    for (let h = arena.openingHour; h < arena.closingHour; h++) {
      allHours.push(h);
    }

    // Step 4: filter available ones
    const availableHours = allHours.filter((h) => !bookedHours.includes(h));

    return {
      arenaId,
      date,
      availableHours,
    };
  }

  async checkIfSlotsBooked(
    arenaId: string,
    date: string,
    hours: number[],
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(ArenaSlot) : this.slotRepo;
    const bookedSlots = await repo.find({
      where: {
        arena: { id: arenaId },
        date,
        hour: In(hours),
        isCanceled: false,
      },
    });
    if (bookedSlots.length > 0) {
      const bookedHours = bookedSlots.map((s) => s.hour);
      return ApiResponseUtil.throwError(
        `Some slots are already booked for this arena: ${bookedHours.join(', ')}`,
        'SLOTS_ALREADY_BOOKED',
        HttpStatus.BAD_REQUEST,
      );
    }
    return;
  }

  async getOccupancyRate(ownerId: string, startDate?: Date, endDate?: Date) {
    // Set default date range to last month to today if not provided
    const today = new Date();
    if (!startDate) {
      startDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate() + 1, // ✔ correct
      );
    }
    if (!endDate) {
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );
    }

    // Step 1: Get count of booked slots for arenas owned by the owner in the date range/
    const bookedSlotsCount = await this.slotRepo
      .createQueryBuilder('slot')
      .innerJoin('slot.arena', 'arena')
      .where('arena.ownerId = :ownerId', { ownerId })
      .andWhere('slot.isCanceled = :isCanceled', { isCanceled: false })
      .andWhere('slot.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    // Step 2: Get total available slots for arenas owned by the owner in the date range
    const totalSlotsCount =
      await this.arenasService.getTotalArenaSlotsCount(ownerId);

    // Step 3: Calculate occupancy rate
    const occupancyRate =
      totalSlotsCount === 0 ? 0 : (bookedSlotsCount / totalSlotsCount) * 100;

    return occupancyRate;
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
      .andWhere('slot.isCanceled = :isCanceled', { isCanceled: false })
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
