import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { DateTime } from 'luxon';
import {
  applyExactFilters,
  applyILikeFilters,
} from 'src/common/utils/filter.utils';
import { paginate } from 'src/common/utils/paginate';
import {
  Between,
  EntityManager,
  In,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationFilterDto } from '../dto/reservation-filter.dto';
import { UpdateReservationDto } from '../dto/update-reservation.dto';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../interfaces/reservation-status.interface';
import { CustomerProfile } from '../../customerProfiles/entities/customer-profile.entity';
import { ReservationValidator } from './reservation-validator.service';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { PaymentMethod } from 'src/common/interfaces/transactions/payment-methods.interface';
import { ReservationAmounts } from '../interfaces/reservation-amounts.interface';
@Injectable()
export class ReservationsService {
  /**
   *
   */
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private readonly reservationValidator: ReservationValidator,
  ) {}

  async loadAndValidateHeldReservation(
    reservationId: string,
    manager: EntityManager,
  ): Promise<Reservation> {
    const reservation = await this.findOneWithRelations(reservationId, manager);

    if (reservation.status !== ReservationStatus.HOLD) {
      ApiResponseUtil.throwError(
        'errors.reservation.not_in_hold',
        'RESERVATION_NOT_IN_HOLD',
        HttpStatus.BAD_REQUEST,
      );
    }

    return reservation;
  }

  /**
   * Pure domain persistence: Instantiates and saves the reservation entity baseline state.
   */
  public async createReservation(
    dto: CreateReservationDto,
    arena: Arena,
    amounts: ReservationAmounts,
    customer: CustomerProfile,
    manager: EntityManager,
    status: ReservationStatus = ReservationStatus.HOLD,
    paymentMethod: PaymentMethod = PaymentMethod.WALLET,
  ): Promise<Reservation> {
    const reservation = manager.create(Reservation, {
      dateOfReservation: dto.date,
      arena,
      status,
      paymentMethod,
      playTotalAmount: amounts.playTotalAmount,
      extrasTotalAmount: amounts.extrasTotalAmount,
      totalAmount: amounts.totalAmount,
      playDepositRate: amounts.playDepositRate,
      extrasDepositRate: amounts.extrasDepositRate,
      playDepositAmount: amounts.playDepositAmount,
      extrasDepositAmount: amounts.extrasDepositAmount,
      depositTotalAmount: amounts.depositTotalAmount,
      customer,
    });

    return manager.save(reservation);
  }

  // 🔒 Private reusable query builder
  private async findReservationsByDateRelation(
    user: User,
    filters: ReservationFilterDto,
    isPast: boolean,
  ) {
    const { page, limit } = filters;
    const today = new Date();

    const query = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.arena', 'arena')
      .leftJoinAndSelect('arena.category', 'category')
      .leftJoinAndSelect('reservation.slots', 'slots')
      .leftJoinAndSelect('reservation.customer', 'customer')
      .where('customer.userId = :userId', { userId: user.id })
      .andWhere(
        isPast
          ? 'reservation.dateOfReservation < :today'
          : 'reservation.dateOfReservation >= :today',
        { today },
      )
      .orderBy('reservation.dateOfReservation', isPast ? 'DESC' : 'ASC');

    // Apply filters
    this.applyFilters(query, filters);

    return await paginate(query, { page, limit });
  }

  private applyFilters<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    filters: ReservationFilterDto,
  ) {
    const alias = '';
    applyExactFilters(
      query,
      { 'arena.categoryId': filters.arenaCategoryId },
      alias,
    );
    applyExactFilters(query, { 'reservation.status': filters.status }, alias);
    applyILikeFilters(query, { 'arena.name': filters.arenaName }, alias);
  }

  // 🌅 Upcoming reservations (today or future)
  async findUpcomingReservations(filters: ReservationFilterDto, user: User) {
    return this.findReservationsByDateRelation(user, filters, false);
  }

  // 🌇 Past reservations (before today)
  async findPastReservations(filters: ReservationFilterDto, user: User) {
    return this.findReservationsByDateRelation(user, filters, true);
  }

  async findReservationsByDateRange(
    arenaId: string,
    user: User,
    startDate: Date,
    endDate: Date,
    filters: ReservationFilterDto,
  ) {
    await this.reservationValidator.validateArenaOwnershipOrAdmin(
      arenaId,
      user,
    );
    const reservations = await this.reservationRepository.find({
      where: {
        arena: { id: arenaId },
        dateOfReservation: Between(startDate, endDate),
        status: In([ReservationStatus.HOLD, ReservationStatus.CONFIRMED]),
      },
    });

    return reservations;
  }

  async findLiveReservationsForArena(
    arenaId: string,
    user: User,
  ): Promise<Reservation[]> {
    // 1. Guard against unauthorized access
    await this.reservationValidator.validateArenaOwnershipOrAdmin(
      arenaId,
      user,
    );

    const now = DateTime.now();

    // Define our 30-minute grace padding boundaries
    const absoluteStartLimit = now.minus({ minutes: 30 }); // Past boundary
    const absoluteEndLimit = now.plus({ minutes: 30 }); // Future boundary

    // Convert boundaries to database formats
    const startDateStr = absoluteStartLimit.toFormat('yyyy-MM-dd');
    const startHourInt = absoluteStartLimit.hour;

    const endDateStr = absoluteEndLimit.toFormat('yyyy-MM-dd');
    const endHourInt = absoluteEndLimit.hour;

    return this.reservationRepository
      .createQueryBuilder('reservation')
      .innerJoinAndSelect('reservation.slots', 'slots')
      .leftJoinAndSelect('reservation.customer', 'customer')
      .leftJoinAndSelect('reservation.extras', 'extras')
      .where('reservation.arenaId = :arenaId', { arenaId })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: [ReservationStatus.HOLD, ReservationStatus.CONFIRMED],
      })
      .andWhere('slots.cancelledAt IS NULL')

      .andWhere(
        `(
        (slots.date = :startDateStr AND slots.hour >= :startHourInt)
        OR
        (slots.date > :startDateStr)
      )
      AND
      (
        (slots.date = :endDateStr AND slots.hour <= :endHourInt)
        OR
        (slots.date < :endDateStr)
      )`,
        {
          startDateStr,
          startHourInt,
          endDateStr,
          endHourInt,
        },
      )
      .getMany();
  }
  async findOne(
    id: string,
    manager?: EntityManager,
  ): Promise<Reservation | never> {
    const repo = manager
      ? manager.getRepository(Reservation)
      : this.reservationRepository;

    this.reservationValidator.validateReservationId(id);
    const reservation = await repo.findOne({
      where: { id },
      loadEagerRelations: false,
    });

    return this.reservationValidator.validateReservationExists(reservation);
  }

  async findOneWithRelations(
    id: string,
    manager?: EntityManager,
  ): Promise<Reservation> {
    const repo = manager
      ? manager.getRepository(Reservation)
      : this.reservationRepository;

    this.reservationValidator.validateReservationId(id);
    const reservation = await repo.findOne({
      where: { id },
      loadEagerRelations: false,
      relations: {
        arena: { owner: true },
        customer: { user: true },
        transactions: {
          user: true,
          extras: { extra: true },
        },
        slots: { court: true },
      },
      order: {
        transactions: {
          createdAt: 'DESC',
        },
      },
    });

    return this.reservationValidator.validateReservationExists(reservation);
  }

  async findDetails(id: string, user: User): Promise<Reservation> {
    await this.reservationValidator.validateCanViewReservationDetails(id, user);

    return this.findOneWithRelations(id);
  }

  async hasUserReservedThisArenaBefore(arenaId: string, userId: string) {
    return await this.reservationRepository.exist({
      where: {
        arena: { id: arenaId },
        customer: { id: userId },
        status: ReservationStatus.CONFIRMED,
      },
    });
  }

  update(id: string, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  remove(id: string) {
    return `This action removes a #${id} reservation`;
  }

  async getNumberOfReservationsByOwner(
    ownerId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const today = new Date();
    // Set default date range to last month to today if not provided
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
    // Get count of reservations for arenas owned by the owner in the date range
    const count = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.arena', 'arena')
      .where('reservation.dateOfReservation BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('arena.ownerId = :ownerId', { ownerId })
      .andWhere('reservation.status != :status', {
        status: ReservationStatus.CANCELED,
      })
      .getCount();

    return count;
  }
}
