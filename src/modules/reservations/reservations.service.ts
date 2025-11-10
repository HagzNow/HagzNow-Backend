import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { paginate } from 'src/common/utils/paginate';
import { DataSource, In, Repository } from 'typeorm';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ArenaExtra } from '../arenas/entities/arena-extra.entity';
import { ArenaSlot } from '../arenas/entities/arena-slot.entity';
import { Arena } from '../arenas/entities/arena.entity';
import { ArenaStatus } from '../arenas/interfaces/arena-status.interface';
import { User } from '../users/entities/user.entity';
import { WalletTransaction } from '../wallets/entities/wallet-transaction.entity';
import { TransactionStage } from '../wallets/interfaces/transaction-stage.interface';
import { TransactionType } from '../wallets/interfaces/transaction-type.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatus } from './interfaces/reservation-status.interface';

@Injectable()
export class ReservationsService {
  /**
   *
   */
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private readonly eventEmitter: EventEmitter2,
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
      if (arena.status !== ArenaStatus.ACTIVE) {
        return ApiResponseUtil.throwError(
          'Arena is not active',
          'ARENA_NOT_ACTIVE',
          HttpStatus.BAD_REQUEST,
        );
      }
      const extras = await queryRunner.manager.findByIds(
        ArenaExtra,
        dto.extras || [],
      );

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

      user.wallet.balance -= totalAmount;
      // user.wallet.heldAmount = (user.wallet.heldAmount || 0) + totalAmount;

      await queryRunner.manager.save([walletTx, user.wallet]);

      // 6️⃣ Commit DB transaction
      await queryRunner.commitTransaction();

      // 7️⃣ Emit reservation created event
      this.eventEmitter.emit('reservation.created', reservation);

      // 8️⃣ Schedule BullMQ settlement job
      // await this.reservationQueue.add(
      //   `settle:${reservation.id}`,
      //   { reservationId: reservation.id },
      //   {
      //     delay: reservation.holdExpiresAt.getTime() - Date.now(),
      //     removeOnComplete: true,
      //     removeOnFail: true,
      //   },
      // );
      reservation.slots = addedSlots;
      return reservation;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.reservationRepository.find();
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
}
