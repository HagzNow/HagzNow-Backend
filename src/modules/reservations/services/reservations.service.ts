import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
  DataSource,
  EntityManager,
  In,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { ArenasService } from '../../arenas/arenas.service';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/interfaces/userRole.interface';
import { WalletsService } from '../../wallets/wallets.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationFilterDto } from '../dto/reservation-filter.dto';
import { UpdateReservationDto } from '../dto/update-reservation.dto';
import { Reservation } from '../entities/reservation.entity';
import { PaymentMethod } from '../interfaces/payment-methods.interface';
import { ReservationStatus } from '../interfaces/reservation-status.interface';
import { ReservationsProducer } from '../queue/reservations.producer';
import { CustomersService } from '../../customerProfiles/customers.service';
import { CreateManualReservationDto } from '../dto/create-manual-reservation.dto';
import { CustomerProfile } from '../../customerProfiles/entities/customer-profile.entity';
import { ReservationPolicy } from './reservation-policy.service';
import { ReservationPaymentService } from './reservation-payment.service';
import { ReservationExtrasService } from '../../reservation-extras/reservation-extras.service';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { ReservationPricingService } from './reservation-pricing.service';
import { CourtSlotsService } from 'src/modules/court-slots/court-slots.service';
@Injectable()
export class ReservationsService {
  /**
   *
   */
  constructor(
    private readonly producer: ReservationsProducer,
    private readonly dataSource: DataSource,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private readonly eventEmitter: EventEmitter2,
    private readonly arenasService: ArenasService,
    private readonly courtSlotsService: CourtSlotsService,
    private readonly walletsService: WalletsService,
    private readonly customersService: CustomersService,
    private readonly reservationPolicy: ReservationPolicy,
    private readonly reservationPaymentService: ReservationPaymentService,
    private readonly reservationExtrasService: ReservationExtrasService,
    private readonly reservationPricingService: ReservationPricingService,
  ) {}

  private async scheduleSettlementJob(reservation: Reservation) {
    // Schedule reservation settlement
    const tz = 'Africa/Cairo';
    const dt = DateTime.fromISO(reservation.dateOfReservation, { zone: tz });

    const runAt = DateTime.fromISO(reservation.dateOfReservation, { zone: tz })
      .startOf('day')
      .toUTC();

    // run after 1 minute for testing
    // const runAt = DateTime.now().plus({ minutes: 1 }).toUTC();
    await this.producer.scheduleSettlement(
      reservation.id,
      runAt,
      reservation.totalAmount,
    );
  }

  async loadAndValidateHeldReservation(
    reservationId: string,
    manager: EntityManager,
  ): Promise<Reservation> {
    const reservation = await this.findOne(reservationId, manager);

    if (reservation.status !== ReservationStatus.HOLD) {
      ApiResponseUtil.throwError(
        'errors.reservation.not_in_hold',
        'RESERVATION_NOT_IN_HOLD',
        HttpStatus.BAD_REQUEST,
      );
    }

    return reservation;
  }

  private async createReservation(
    dto: CreateReservationDto,
    arena: Arena,
    amounts: { playAmount: number; extrasAmount: number; totalAmount: number },
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
      playTotalAmount: amounts.playAmount,
      extrasTotalAmount: amounts.extrasAmount,
      totalAmount: amounts.totalAmount,
      customer,
    });

    return manager.save(reservation);
  }

  async create(dto: CreateReservationDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const slots = dto.slots
        .map(({ slots }) => slots)
        .flat()
        .map(Number);

      // Validate it's not previous time
      this.reservationPolicy.validateDateAndSlots(dto.date, slots);

      // Load arena & extras
      const {
        courts,
        arena,
        extras: arenaExtras,
      } = await this.reservationPolicy.extractCourtsAndArenaAndExtras(
        dto,
        queryRunner,
      );

      // validate slots are within arena opening hours
      this.arenasService.validateSlotsAreInAllowedRange(slots, arena);

      // Find customer profile
      const customer = await this.customersService.findOneById(user.id);

      // Validate slots are not already booked
      await this.courtSlotsService.validateSlotsAreAvailable(
        dto.slots,
        dto.date,
        queryRunner.manager,
      );

      // calculate amounts
      const amounts =
        this.reservationPricingService.calculateReservationAmounts(
          arena,
          slots,
          arenaExtras,
        );

      // Validate user has sufficient balance in wallet
      await this.walletsService.validateSufficientBalance(
        user.id,
        amounts.totalAmount,
        queryRunner.manager,
      );

      const reservation = await this.createReservation(
        dto,
        arena,
        amounts,
        customer,
        queryRunner.manager,
      );
      // Convert ArenaExtra[] to ReservationExtra[]
      reservation.extras = await this.reservationExtrasService.createExtras(
        reservation,
        arenaExtras,
        queryRunner.manager,
      );

      reservation.slots = await this.courtSlotsService.createSlots(
        dto.slots,
        reservation,
        dto.date,
        courts,
        queryRunner.manager,
      );

      const paymentContext =
        this.reservationPolicy.buildPaymentContext(reservation);

      // Place hold on payment and perform wallet deduction & transaction creation
      await this.reservationPaymentService.hold(
        paymentContext,
        queryRunner.manager,
      );

      // Schedule reservation settlement (bull job will validate the transaction is in HOLD stage before processing)
      await this.scheduleSettlementJob(reservation);

      await queryRunner.commitTransaction();

      this.eventEmitter.emit('reservation.created', reservation);

      return reservation;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createManualReservation(dto: CreateManualReservationDto, user: User) {
    // Similar to create method but without wallet and transaction logic
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const slots = dto.slots
        .map(({ slots }) => slots)
        .flat()
        .map(Number);

      // Validate it's not previous time
      this.reservationPolicy.validateDateAndSlots(dto.date, slots);

      // Load arena & extras
      const {
        courts,
        arena,
        extras: arenaExtras,
      } = await this.reservationPolicy.extractCourtsAndArenaAndExtras(
        dto,
        queryRunner,
      );

      // validate slots are within arena opening hours
      this.arenasService.validateSlotsAreInAllowedRange(slots, arena);

      // Check arena ownership
      this.arenasService.ensureOwner(arena, user);

      // Find customer profile if ID provided
      let customer = await this.reservationPolicy.resolveCustomer(dto);

      // Validate slots are not already booked
      await this.courtSlotsService.validateSlotsAreAvailable(
        dto.slots,
        dto.date,
        queryRunner.manager,
      );

      // calculate amounts
      const amounts =
        this.reservationPricingService.calculateReservationAmounts(
          arena,
          slots,
          arenaExtras,
        );
      // Create reservation
      const reservation = await this.createReservation(
        dto,
        arena,
        amounts,
        customer,
        queryRunner.manager,
        ReservationStatus.CONFIRMED,
        PaymentMethod.MANUAL,
      );

      // Convert ArenaExtra[] to ReservationExtra[]
      reservation.extras = await this.reservationExtrasService.createExtras(
        reservation,
        arenaExtras,
        queryRunner.manager,
      );

      // Create slots for the reservation
      reservation.slots = await this.courtSlotsService.createSlots(
        dto.slots,
        reservation,
        dto.date,
        courts,
        queryRunner.manager,
      );

      //Commit DB transaction
      await queryRunner.commitTransaction();
      return reservation;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating manual reservation:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async settleReservation(reservationId: string) {
    console.log('Settling reservation:', reservationId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const reservation = await this.loadAndValidateHeldReservation(
        reservationId,
        queryRunner.manager,
      );
      const user = this.reservationPolicy.validateExistingUser(reservation);

      // Update reservation status to CONFIRMED
      reservation.status = ReservationStatus.CONFIRMED;

      const paymentContext =
        this.reservationPolicy.buildPaymentContext(reservation);
      await this.reservationPaymentService.settle(
        paymentContext,
        queryRunner.manager,
      );

      await queryRunner.manager.save([reservation]);

      await queryRunner.commitTransaction();

      console.log('Reservation settled successfully:', reservationId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Error settling reservation:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelReservation(reservationId: string, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Remove from the settlement queue
    try {
      const removed = await this.producer.removeSettlement(reservationId);
      // In case of not removed from the queue, throw error (it means it was not found)
      if (!removed) {
        // return ApiResponseUtil.throwError(
        //   'Reservation settlement job not found in queue',
        //   'SETTLEMENT_JOB_NOT_FOUND',
        //   HttpStatus.NOT_FOUND,
        // );
      }
      // Load reservation & update its status
      const reservation = await this.findOne(
        reservationId,
        queryRunner.manager,
      );

      // Validate status and ownership for cancellation
      await this.reservationPolicy.validateStatusAndOwnershipForCancellation(
        reservation,
        user,
      );

      // Update reservation status to CANCELED
      reservation.status = ReservationStatus.CANCELED;

      // Validate the transaction is in HOLD stage and belongs to this reservation
      await this.reservationPolicy.validateHeldTransaction(
        reservation,
        queryRunner.manager,
      );

      // Mark all slots as canceled
      await this.courtSlotsService.cancelSlots(
        reservation.slots,
        queryRunner.manager,
      );

      // Mark all extras as canceled
      await this.reservationExtrasService.cancelAllExtras(
        reservation.id,
        queryRunner.manager,
      );

      // build payment context
      const paymentContext =
        this.reservationPolicy.buildPaymentContext(reservation);

      // Process payment refund
      await this.reservationPaymentService.refund(
        paymentContext,
        queryRunner.manager,
      );

      await queryRunner.manager.save([reservation]);
      await queryRunner.commitTransaction();
      console.log('Reservation canceled successfully:', reservationId);
      return true;
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
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
    const arena = await this.arenasService.findOne(arenaId);
    if (arena.owner.id !== user.id && user.role !== UserRole.ADMIN) {
      return ApiResponseUtil.throwError(
        'errors.general.unauthorized',
        'UNAUTHORIZED_ACCESS',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const reservations = await this.reservationRepository.find({
      where: {
        arena: { id: arenaId },
        dateOfReservation: Between(startDate, endDate),
        status: In([ReservationStatus.HOLD, ReservationStatus.CONFIRMED]),
      },
    });

    return reservations;
  }

  async findOne(id: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Reservation)
      : this.reservationRepository;

    if (!id) {
      return ApiResponseUtil.throwError(
        'errors.reservation.id_required',
        'RESERVATION_ID_REQUIRED',
        HttpStatus.BAD_REQUEST,
      );
    }
    const reservation = await repo.findOne({
      where: { id },
      relations: {
        arena: { owner: true },
        customer: { user: true },
        extras: true,
        slots: { court: true },
      },
    });
    if (!reservation) {
      return ApiResponseUtil.throwError(
        'errors.reservation.not_found',
        'RESERVATION_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return reservation;
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
