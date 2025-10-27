import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { DataSource, In, Repository } from 'typeorm';
import { ArenaExtra } from '../arenas/entities/arena-extra.entity';
import { ArenaSlot } from '../arenas/entities/arena-slot.entity';
import { Arena } from '../arenas/entities/arena.entity';
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
      console.log('--------------------------------------------------/n', {
        playAmount,
        extrasAmount,
        totalAmount,
      });

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
        user,
        status: ReservationStatus.HOLD,
        dateOfReservation: dto.date,
        totalAmount: totalAmount,
        playTotalAmount: playAmount,
        extrasTotalAmount: extrasAmount,
      });
      await queryRunner.manager.save(reservation);

      // 4️⃣ Create arena slots linked to this reservation
      for (const hour of dto.slots) {
        const slot = queryRunner.manager.create(ArenaSlot, {
          arena,
          reservation,
          date: dto.date,
          hour,
        });
        await queryRunner.manager.save(slot);
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

  findOne(id: string) {
    return `This action returns a #${id} reservation`;
  }

  update(id: string, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  remove(id: string) {
    return `This action removes a #${id} reservation`;
  }
}
