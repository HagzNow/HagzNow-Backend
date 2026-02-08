import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import {
  applyExactFilters,
  applyILikeFilters,
} from 'src/common/utils/filter.utils';
import { paginate } from 'src/common/utils/paginate';
import {
  Between,
  DataSource,
  In,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ArenaSlotsService } from '../arenas/arena-slots.service';
import { ArenasService } from '../arenas/arenas.service';
import { ArenaSlot } from '../arenas/entities/arena-slot.entity';
import { ArenaStatus } from '../arenas/interfaces/arena-status.interface';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { UsersService } from '../users/users.service';
import { TransactionStage } from '../wallets/interfaces/transaction-stage.interface';
import { TransactionType } from '../wallets/interfaces/transaction-type.interface';
import { WalletTransactionService } from '../wallets/wallet-transaction.service';
import { WalletsService } from '../wallets/wallets.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationFilterDto } from './dto/reservation-filter.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { PaymentMethod } from './interfaces/payment-methods.interface';
import { ReservationStatus } from './interfaces/reservation-status.interface';
import { ReservationsProducer } from './queue/reservations.producer';
import { CustomersService } from '../customerProfiles/customers.service';
import { CreateManualReservationDto } from './dto/create-manual-reservation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CustomerProfile } from '../customerProfiles/entities/customer-profile.entity';

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
    private readonly arenaSlotsService: ArenaSlotsService,
    private readonly usersService: UsersService,
    private readonly walletsService: WalletsService,
    private readonly walletTransactionService: WalletTransactionService,
    private readonly customersService: CustomersService,
  ) {}

  private validateIfDateIsInThePast(date: string, slots: number[]) {
    const now = DateTime.now().setZone('Africa/Cairo');
    const reservationDate = DateTime.fromISO(date, {
      zone: 'Africa/Cairo',
    });
    if (reservationDate < now.startOf('day')) {
      return ApiResponseUtil.throwError(
        'Cannot make reservation for past dates',
        'RESERVATION_DATE_IN_PAST',
        HttpStatus.BAD_REQUEST,
      );
    }
    // validate it's not previous slot
    let CurrentHour = now.hour;
    if (
      slots.some((h) => Number(h) <= CurrentHour) &&
      reservationDate.hasSame(now, 'day')
    ) {
      return ApiResponseUtil.throwError(
        'Cannot make reservation for past slots',
        'RESERVATION_SLOT_IN_PAST',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(dto: CreateReservationDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate it's not previous time
      this.validateIfDateIsInThePast(dto.date, dto.slots);

      // Load user
      const user = await this.usersService.findOneById(
        userId,
        queryRunner.manager,
      );
      if (!user) {
        return ApiResponseUtil.throwError(
          'User not found',
          'USER_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      // Find customer profile
      let customer = await this.customersService.findOneById(userId);

      // Load arena
      const arena = await this.arenasService.findOne(
        dto.arenaId,
        queryRunner.manager,
      );

      // Make sure arena is active
      if (arena.status !== ArenaStatus.ACTIVE) {
        return ApiResponseUtil.throwError(
          'Arena is not active',
          'ARENA_NOT_ACTIVE',
          HttpStatus.BAD_REQUEST,
        );
      }
      // Load extras
      const extras = await this.arenasService.findArenaExtrasByIds(
        dto.arenaId,
        dto.extras || [],
        queryRunner.manager,
      );

      // validate all extras found
      if (extras.length !== (dto.extras || []).length) {
        return ApiResponseUtil.throwError(
          'One or more extras not found',
          'EXTRAS_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      // Validate slots are not already booked
      const bookedHours = await this.arenaSlotsService.getBookedHours(
        dto.arenaId,
        dto.date,
        dto.slots,
        queryRunner.manager,
      );
      if (bookedHours.length > 0) {
        return ApiResponseUtil.throwError(
          `Some slots are already booked for this arena: ${bookedHours.join(
            ', ',
          )}`,
          'SLOTS_ALREADY_BOOKED',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Calculate amounts
      const playAmount = arena.depositAmount(dto.slots.length);
      const extrasAmount = arena.extrasAmount(extras);
      const totalAmount = playAmount + extrasAmount;

      // Check user balance
      const hasEnoughBalance = await this.walletsService.hasEnoughBalance(
        userId,
        Number(totalAmount),
        queryRunner.manager,
      );
      if (!hasEnoughBalance) {
        return ApiResponseUtil.throwError(
          'Insufficient wallet balance',
          'INSUFFICIENT_BALANCE',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create reservation (HOLD)
      const reservation = queryRunner.manager.create(Reservation, {
        dateOfReservation: dto.date,
        arena,
        status: ReservationStatus.HOLD,
        playTotalAmount: playAmount,
        extrasTotalAmount: extrasAmount,
        totalAmount: totalAmount,
        extras: dto.extras ? extras : [],
        customer,
      });
      await queryRunner.manager.save(reservation);

      // Calculate amounts to credit for owner
      const amountToCredit = arena.ownerAmount(dto.slots.length, extras);

      // Create arena slots linked to this reservation
      const addedSlots: ArenaSlot[] = await this.arenaSlotsService.createSlots(
        arena,
        reservation,
        dto.date,
        dto.slots.map((h) => Number(h)),
        queryRunner.manager,
      );

      // Create wallet HOLD transaction for user
      const walletTx = await this.walletTransactionService.create(
        {
          amount: Number(totalAmount),
          stage: TransactionStage.HOLD,
          type: TransactionType.PAYMENT,
          referenceId: reservation.id,
        },
        user,
        queryRunner.manager,
      );
      // Update user wallet held amount
      await this.walletsService.lockAmount(
        user.id,
        Number(totalAmount),
        queryRunner.manager,
      );

      // Update arena owner wallet held amount
      await this.walletsService.addToHeldAmount(
        arena.owner.id,
        Number(amountToCredit),
        queryRunner.manager,
      );

      // Update admin wallet held amount
      const adminId = process.env.ADMIN_ID;
      if (!adminId) {
        return ApiResponseUtil.throwError(
          'Admin ID not configured',
          'ADMIN_ID_NOT_CONFIGURED',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.walletsService.addToHeldAmount(
        adminId,
        arena.adminAmount(dto.slots.length, extras),
        queryRunner.manager,
      );

      // Schedule reservation settlement
      const tz = 'Africa/Cairo';
      const dt = DateTime.fromISO(dto.date, { zone: tz });

      console.log(dt.toISO());
      console.log(dt.zoneName);
      const runAt = DateTime.fromISO(dto.date, { zone: tz })
        .startOf('day')
        .toUTC();
      // const runAt = DateTime.now().plus({ seconds: 10 });
      await this.producer.scheduleSettlement(
        reservation.id,
        runAt,
        totalAmount,
      );

      // 6️⃣ Commit DB transaction
      await queryRunner.commitTransaction();

      // 7️⃣ Emit reservation created event
      this.eventEmitter.emit('reservation.created', reservation);

      reservation.slots = addedSlots;
      return reservation;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating reservation:', err);
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
      // Validate it's not previous time
      this.validateIfDateIsInThePast(dto.date, dto.slots);
      // Load arena
      const arena = await this.arenasService.findOne(
        dto.arenaId,
        queryRunner.manager,
      );
      if (arena.status !== ArenaStatus.ACTIVE) {
        return ApiResponseUtil.throwError(
          'Arena is not active',
          'ARENA_NOT_ACTIVE',
          HttpStatus.BAD_REQUEST,
        );
      }
      // Check arena ownership
      if (arena.owner.id !== user.id) {
        return ApiResponseUtil.throwError(
          'Unauthorized access to arena reservations',
          'UNAUTHORIZED_ACCESS',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Find customer profile if ID provided
      let customer: CustomerProfile;
      if (dto.customerId) {
        customer = await this.customersService.findOneById(dto.customerId);
      } else {
        // it's not provided create new customer from the provided data
        customer = await this.customersService.create(dto.customerDto);
      }

      // Load extras
      const extras = await this.arenasService.findArenaExtrasByIds(
        dto.arenaId,
        dto.extras || [],
        queryRunner.manager,
      );
      // validate all extras found
      if (extras.length !== (dto.extras || []).length) {
        return ApiResponseUtil.throwError(
          'One or more extras not found',
          'EXTRAS_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
      // Validate slots are not already booked
      const bookedHours = await this.arenaSlotsService.getBookedHours(
        dto.arenaId,
        dto.date,
        dto.slots,
        queryRunner.manager,
      );
      if (bookedHours.length > 0) {
        return ApiResponseUtil.throwError(
          'One or more slots are already booked',
          'SLOTS_ALREADY_BOOKED',
          HttpStatus.CONFLICT,
        );
      }

      const reservation = queryRunner.manager.create(Reservation, {
        dateOfReservation: dto.date,
        arena,
        status: ReservationStatus.CONFIRMED,
        playTotalAmount: 0,
        extrasTotalAmount: 0,
        totalAmount: 0,
        extras: dto.extras ? extras : [],
        customer,
        paymentMethod: PaymentMethod.MANUAL,
      });
      await queryRunner.manager.save(reservation);
      const addedSlots: ArenaSlot[] = await this.arenaSlotsService.createSlots(
        arena,
        reservation,
        dto.date,
        dto.slots.map((h) => Number(h)),
        queryRunner.manager,
      );
      reservation.slots = addedSlots;

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

  async findAll() {
    return await this.reservationRepository.find();
  }

  async settleReservation(reservationId: string) {
    console.log('Settling reservation:', reservationId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const reservation = await queryRunner.manager.findOne(Reservation, {
        where: { id: reservationId },
        relations: ['customer', 'arena', 'arena.owner', 'extras', 'slots'],
      });
      if (!reservation) {
        console.log('Reservation not found:', reservationId);
        return ApiResponseUtil.throwError(
          'Reservation not found',
          'RESERVATION_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
      if (reservation.status !== ReservationStatus.HOLD) {
        console.log('Reservation not in HOLD status:', reservationId);
        return ApiResponseUtil.throwError(
          'Reservation is not in HOLD status',
          'RESERVATION_NOT_IN_HOLD',
          HttpStatus.BAD_REQUEST,
        );
      }
      const arena = reservation.arena;
      const extras = reservation.extras;
      const slots = reservation.slots;

      const customer = reservation.customer;
      const user = customer?.user;

      if (!user) {
        return ApiResponseUtil.throwError(
          'Customer user not found',
          'CUSTOMER_USER_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      const adminId = process.env.ADMIN_ID;
      if (!adminId) {
        console.log('Admin ID not configured');
        return ApiResponseUtil.throwError(
          'Admin ID not configured',
          'ADMIN_ID_NOT_CONFIGURED',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Update reservation status to CONFIRMED
      reservation.status = ReservationStatus.CONFIRMED;

      // Update wallet transaction stage to PROCESSED
      const transaction =
        await this.walletTransactionService.updateByReferenceId(
          reservation.id,
          TransactionStage.PROCESSED,
          queryRunner.manager,
        );

      // Add transaction for settled
      const settledTransaction = await this.walletTransactionService.create(
        {
          amount: Number(reservation.totalAmount),
          type: TransactionType.PAYMENT,
          referenceId: reservation.id,
          stage: TransactionStage.SETTLED,
        },
        user,
        queryRunner.manager,
      );
      // Unlock user wallet held amount
      await this.walletsService.unlockAmount(
        user.id,
        Number(reservation.totalAmount),
        queryRunner.manager,
      );

      // Calculate amounts to credit for owner
      const amountToCredit = arena.ownerAmount(slots.length, extras);

      // Release held amount from arena owner wallet
      await this.walletsService.releaseHeldAmount(
        reservation.arena.owner.id,
        Number(amountToCredit),
        queryRunner.manager,
      );

      // Create wallet transaction for arena owner
      const ownerWalletTx = await this.walletTransactionService.create(
        {
          amount: Number(amountToCredit),
          type: TransactionType.DEPOSIT,
          stage: TransactionStage.INSTANT,
          referenceId: reservation.id,
        },
        reservation.arena.owner,
        queryRunner.manager,
      );

      //  Add admin fee
      const admin = await queryRunner.manager.findOne(User, {
        where: { id: process.env.ADMIN_ID },
      });
      if (!admin) {
        console.log('Admin user not found');
        return ApiResponseUtil.throwError(
          'Admin user not found',
          'ADMIN_USER_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
      // Add admin fee to admin wallet
      const adminFeeTx = await this.walletTransactionService.create(
        {
          amount: arena.adminAmount(slots.length, extras),
          type: TransactionType.DEPOSIT,
          stage: TransactionStage.INSTANT,
          referenceId: reservation.id,
        },
        admin,
        queryRunner.manager,
      );

      // Release held amount from admin wallet
      await this.walletsService.releaseHeldAmount(
        admin.id,
        arena.adminAmount(slots.length, extras),
        queryRunner.manager,
      );

      await queryRunner.manager.save([
        reservation,
        transaction,
        settledTransaction,
        ownerWalletTx,
        adminFeeTx,
      ]);

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
      const reservation = await queryRunner.manager.findOne(Reservation, {
        where: { id: reservationId },
        relations: [
          'customer',
          'arena',
          'arena.owner',
          'arena.extras',
          'slots',
        ],
      });
      if (!reservation) {
        return ApiResponseUtil.throwError(
          'Reservation not found',
          'RESERVATION_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
      // Load associated wallet transaction
      const transaction =
        await this.walletTransactionService.findOneByReferenceId(
          reservation.id,
          queryRunner.manager,
        );

      if (!transaction || transaction.stage !== TransactionStage.HOLD) {
        return ApiResponseUtil.throwError(
          'Associated wallet transaction not found or not in HOLD stage',
          'WALLET_TRANSACTION_NOT_FOUND_OR_INVALID_STAGE',
          HttpStatus.NOT_FOUND,
        );
      }
      const arena = reservation.arena;

      // Update transaction stage to processed
      await this.walletTransactionService.updateByReferenceId(
        reservation.id,
        TransactionStage.PROCESSED,
        queryRunner.manager,
      );

      // Update reservation status to CANCELED
      reservation.status = ReservationStatus.CANCELED;

      // Mark all slots as canceled
      await this.arenaSlotsService.cancelSlots(
        reservation.slots,
        queryRunner.manager,
      );

      const playerTotalAmount = arena.playerTotalAmount(
        reservation.slots.length,
        reservation.extras,
      );

      // Add transaction for refund
      const refundTransaction = await this.walletTransactionService.create(
        {
          amount: Number(playerTotalAmount),
          referenceId: reservation.id,
          stage: TransactionStage.REFUND,
          type: TransactionType.REFUND,
        },
        user,
        queryRunner.manager,
      );

      // Refund user wallet
      await this.walletsService.releaseHeldAmount(
        user.id,
        Number(playerTotalAmount),
        queryRunner.manager,
      );
      const amountToCredit = arena.ownerAmount(
        reservation.slots.length,
        reservation.extras,
      );

      // Remove held amount from arena owner wallet
      await this.walletsService.removeFromHeldAmount(
        reservation.arena.owner.id,
        Number(amountToCredit),
        queryRunner.manager,
      );

      // Remove held amount from admin wallet
      const adminId = process.env.ADMIN_ID;
      if (!adminId) {
        return ApiResponseUtil.throwError(
          'Admin ID not configured',
          'ADMIN_ID_NOT_CONFIGURED',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.walletsService.removeFromHeldAmount(
        adminId,
        arena.adminAmount(reservation.slots.length, reservation.extras),
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
    paginationDto: PaginationDto,
    filters: ReservationFilterDto,
    isPast: boolean,
  ) {
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

    return await paginate(query, paginationDto);
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
  async findUpcomingReservations(
    paginationDto: PaginationDto,
    filters: ReservationFilterDto,
    user: User,
  ) {
    return this.findReservationsByDateRelation(
      user,
      paginationDto,
      filters,
      false,
    );
  }

  // 🌇 Past reservations (before today)
  async findPastReservations(
    paginationDto: PaginationDto,
    filters: ReservationFilterDto,
    user: User,
  ) {
    return this.findReservationsByDateRelation(
      user,
      paginationDto,
      filters,
      true,
    );
  }

  async findReservationsByDateRange(
    arenaId: string,
    user: User,
    startDate: Date,
    endDate: Date,
    filters: ReservationFilterDto,
  ) {
    const arena = await this.arenasService.findOne(arenaId);
    if (!arena) {
      return ApiResponseUtil.throwError(
        'Arena not found',
        'ARENA_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    if (arena.owner.id !== user.id && user.role !== UserRole.ADMIN) {
      return ApiResponseUtil.throwError(
        'Unauthorized access to arena reservations',
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

  async findOne(id: string) {
    if (!id) return null;
    return await this.reservationRepository.findOneBy({ id });
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
  stringToDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-based in JS Date
  }
}
