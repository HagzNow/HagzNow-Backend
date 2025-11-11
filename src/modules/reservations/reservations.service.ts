import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { paginate } from 'src/common/utils/paginate';
import { Between, DataSource, In, Repository } from 'typeorm';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ArenasService } from '../arenas/arenas.service';
import { ArenaExtra } from '../arenas/entities/arena-extra.entity';
import { ArenaSlot } from '../arenas/entities/arena-slot.entity';
import { Arena } from '../arenas/entities/arena.entity';
import { ArenaStatus } from '../arenas/interfaces/arena-status.interface';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { WalletTransaction } from '../wallets/entities/wallet-transaction.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { TransactionStage } from '../wallets/interfaces/transaction-stage.interface';
import { TransactionType } from '../wallets/interfaces/transaction-type.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatus } from './interfaces/reservation-status.interface';
import { ReservationsProducer } from './queue/reservations.producer';

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
  ) {}
  async create(dto: CreateReservationDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['wallet'],
      });

      if (!user) {
        return ApiResponseUtil.throwError(
          'User not found',
          'USER_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      const arena = await queryRunner.manager.findOne(Arena, {
        where: { id: dto.arenaId },
      });

      if (!arena) {
        return ApiResponseUtil.throwError(
          'Arena not found',
          'ARENA_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
      const arenaOwnerWallet = arena.owner.wallet;

      if (arena.status !== ArenaStatus.ACTIVE) {
        return ApiResponseUtil.throwError(
          'Arena is not active',
          'ARENA_NOT_ACTIVE',
          HttpStatus.BAD_REQUEST,
        );
      }
      const extras = await queryRunner.manager.findBy(ArenaExtra, {
        id: In(dto.extras || []),
        arena: { id: dto.arenaId },
      });
      if (extras.length !== (dto.extras || []).length) {
        return ApiResponseUtil.throwError(
          'Some extras not found for this arena',
          'ARENA_EXTRAS_NOT_FOUND',
          HttpStatus.BAD_REQUEST,
        );
      }

      const playAmount = arena.getDepositAmount(dto.slots.length);
      const extrasAmount = extras.reduce(
        (sum, extra) => sum + Number(extra.price),
        0,
      );
      const totalAmount = playAmount + extrasAmount;

      // 1️⃣ Check user balance
      if (!user.wallet || user.wallet.balance < totalAmount) {
        return ApiResponseUtil.throwError(
          'Insufficient wallet balance',
          'INSUFFICIENT_BALANCE',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2️⃣ Validate slots are not already booked
      const existingSlots = await queryRunner.manager.find(ArenaSlot, {
        where: {
          arena: { id: dto.arenaId },
          date: dto.date,
          hour: In(dto.slots),
          // isCanceled: false,
        },
      });

      if (existingSlots.length > 0) {
        const bookedHours = existingSlots.map((s) => s.hour);
        return ApiResponseUtil.throwError(
          `Some slots are already booked for this arena: ${bookedHours.join(', ')}`,
          'SLOTS_ALREADY_BOOKED',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3️⃣ Create reservation (HOLD)
      const reservation = queryRunner.manager.create(Reservation, {
        dateOfReservation: dto.date,
        arena,
        status: ReservationStatus.HOLD,
        playTotalAmount: playAmount,
        extrasTotalAmount: extrasAmount,
        totalAmount: totalAmount,
        extras: dto.extras ? extras : [],
        user,
      });
      await queryRunner.manager.save(reservation);

      // 4️⃣ Create arena slots linked to this reservation
      const addedSlots: ArenaSlot[] = [];
      for (const hour of dto.slots) {
        const slot = queryRunner.manager.create(ArenaSlot, {
          arena,
          reservation,
          date: dto.date,
          hour,
        });
        await queryRunner.manager.save(slot);
        addedSlots.push(slot);
      }

      // 5️⃣ Create wallet HOLD transaction
      const walletTx = queryRunner.manager.create(WalletTransaction, {
        wallet: user.wallet,
        amount: totalAmount,
        type: TransactionType.PAYMENT,
        stage: TransactionStage.HOLD,
        referenceId: reservation.id,
      });

      user.wallet.balance = Number(user.wallet.balance) - totalAmount;
      user.wallet.heldAmount =
        Number(user.wallet.heldAmount || 0) + totalAmount;
      arenaOwnerWallet.heldAmount =
        Number(arenaOwnerWallet.heldAmount || 0) + totalAmount;

      await queryRunner.manager.save([walletTx, user.wallet, arenaOwnerWallet]);

      const tz = 'Africa/Cairo';
      // const runAt = DateTime.fromISO(dto.date, { zone: tz }).startOf('day');
      const runAt = DateTime.now().plus({ seconds: 600 });
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

  async findAll() {
    return await this.reservationRepository.find();
  }

  async settleReservation(reservationId: string) {
    console.log('Settling reservation:', reservationId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const reservation = await this.reservationRepository.findOne({
        where: { id: reservationId },
        relations: ['user', 'arena', 'arena.owner'],
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

      const user = reservation.user;
      const userWallet = user.wallet;
      const arenaOwnerWallet = reservation.arena.owner.wallet;
      const adminWallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: process.env.ADMIN_WALLET_ID },
      });
      if (!adminWallet) {
        console.log('Admin wallet not found');
        return ApiResponseUtil.throwError(
          'Admin wallet not found',
          'ADMIN_WALLET_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      // Update reservation status to CONFIRMED
      reservation.status = ReservationStatus.CONFIRMED;

      const transaction = await queryRunner.manager.findOne(WalletTransaction, {
        where: {
          referenceId: reservation.id,
          stage: TransactionStage.HOLD,
        },
      });
      if (!transaction) {
        console.log(
          'Associated wallet transaction not found for reservation:',
          reservationId,
        );
        return ApiResponseUtil.throwError(
          'Associated wallet transaction not found',
          'WALLET_TRANSACTION_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      // Add transaction for settled
      const settledTransaction = queryRunner.manager.create(WalletTransaction, {
        ...transaction,
        id: undefined,
        stage: TransactionStage.SETTLED,
      });
      // Update user wallet held amount
      userWallet.heldAmount =
        Number(userWallet.heldAmount || 0) - reservation.totalAmount;

      // Apply admin fee and credit arena owner's wallet
      const adminFeeRate = 0.1;
      const amountToCredit = reservation.totalAmount * (1 - adminFeeRate);

      // Create wallet transaction for arena owner
      const ownerWalletTx = queryRunner.manager.create(WalletTransaction, {
        wallet: arenaOwnerWallet,
        amount: amountToCredit,
        type: TransactionType.PAYMENT,
        stage: TransactionStage.INSTANT,
        referenceId: reservation.id,
      });

      arenaOwnerWallet.heldAmount =
        Number(arenaOwnerWallet.heldAmount || 0) - reservation.totalAmount;
      arenaOwnerWallet.balance =
        Number(arenaOwnerWallet.balance || 0) + amountToCredit;

      //  Add admin fee
      const adminFeeTx = queryRunner.manager.create(WalletTransaction, {
        wallet: adminWallet,
        amount: reservation.totalAmount * adminFeeRate,
        type: TransactionType.FEE,
        stage: TransactionStage.INSTANT,
        referenceId: reservation.id,
      });
      adminWallet.balance =
        (adminWallet.balance || 0) + reservation.totalAmount * adminFeeRate;

      await queryRunner.manager.save([
        reservation,
        transaction,
        userWallet,
        arenaOwnerWallet,
        ownerWalletTx,
        adminWallet,
        adminFeeTx,
      ]);

      await queryRunner.commitTransaction();

      console.log('Reservation settled successfully:', reservationId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating reservation:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelReservation(reservationId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Remove from the settlement queue
    try {
      const removed = await this.producer.removeSettlement(reservationId);
      // In case of not removed from the queue, throw error (it means it was not found)
      if (!removed) {
        return ApiResponseUtil.throwError(
          'Reservation settlement job not found in queue',
          'SETTLEMENT_JOB_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
      // Load reservation & update its status
      const reservation = await queryRunner.manager.findOne(Reservation, {
        where: { id: reservationId },
        relations: ['user', 'arena', 'arena.owner'],
      });
      if (!reservation) {
        return ApiResponseUtil.throwError(
          'Reservation not found',
          'RESERVATION_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
      // Load associated wallet transaction
      const transaction = await queryRunner.manager.findOne(WalletTransaction, {
        where: {
          referenceId: reservationId,
          stage: TransactionStage.HOLD,
        },
        relations: ['wallet'],
      });
      if (!transaction) {
        return ApiResponseUtil.throwError(
          'Associated wallet transaction not found',
          'WALLET_TRANSACTION_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
      // Update reservation status to CANCELED
      reservation.status = ReservationStatus.CANCELED;

      // Add transaction for refund
      const refundTransaction = queryRunner.manager.create(WalletTransaction, {
        ...transaction,
        id: undefined,
        stage: TransactionStage.REFUND,
      });

      // Refund user wallet
      const userWallet = transaction.wallet;
      userWallet.heldAmount =
        Number(userWallet.heldAmount || 0) - Number(reservation.totalAmount);
      userWallet.balance = Number(reservation.totalAmount);

      // Update arena owner wallet held amount
      const arenaOwnerWallet = reservation.arena.owner.wallet;
      arenaOwnerWallet.heldAmount =
        Number(arenaOwnerWallet.heldAmount || 0) -
        Number(reservation.totalAmount);

      await queryRunner.manager.save([
        reservation,
        refundTransaction,
        userWallet,
        arenaOwnerWallet,
      ]);
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
    isPast: boolean,
  ) {
    const today = new Date();

    const query = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.arena', 'arena')
      .leftJoinAndSelect('reservation.slots', 'slots')
      .where('reservation.userId = :userId', { userId: user.id })
      .andWhere(
        isPast
          ? 'reservation.dateOfReservation < :today'
          : 'reservation.dateOfReservation >= :today',
        { today },
      )
      .orderBy('reservation.dateOfReservation', isPast ? 'DESC' : 'ASC');

    return await paginate(query, paginationDto);
  }

  // 🌅 Upcoming reservations (today or future)
  async findUpcomingReservations(paginationDto: PaginationDto, user: User) {
    return this.findReservationsByDateRelation(user, paginationDto, false);
  }

  // 🌇 Past reservations (before today)
  async findPastReservations(paginationDto: PaginationDto, user: User) {
    return this.findReservationsByDateRelation(user, paginationDto, true);
  }

  async findReservationsByDateRange(
    arenaId: string,
    user: User,
    startDate: Date,
    endDate: Date,
  ) {
    const arena = await this.arenasService.findOne(arenaId);
    if (!arena) {
      return ApiResponseUtil.throwError(
        'Arena not found',
        'ARENA_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    if (arena.owner.id !== user.id || user.role !== UserRole.ADMIN) {
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
      },
    });

    return reservations;
  }

  async findOne(id: string) {
    if (!id) return null;
    return await this.reservationRepository.findOneBy({ id });
  }

  update(id: string, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  remove(id: string) {
    return `This action removes a #${id} reservation`;
  }
  stringToDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-based in JS Date
  }
}
