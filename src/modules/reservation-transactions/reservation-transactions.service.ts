import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ReservationTransaction } from './entities/reservation-transaction.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReservationTransactionDto } from './dto/create-reservation-transaction.dto';
import { TransactionType } from 'src/common/interfaces/transactions/transaction-type.interface';
import { PaymentMethod } from 'src/common/interfaces/transactions/payment-methods.interface';
import { User } from '../users/entities/user.entity';
import { ReservationsService } from '../reservations/services/reservations.service';
import { Reservation } from '../reservations/entities/reservation.entity';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { UpdateReservationTransactionDto } from './dto/update-reservation-transaction.dto';

@Injectable()
export class ReservationTransactionsService {
  constructor(
    @InjectRepository(ReservationTransaction)
    private reservationTransactionRepository: Repository<ReservationTransaction>,
    @Inject(forwardRef(() => ReservationsService))
    private readonly reservationsService: ReservationsService,
  ) {}

  private async create(
    createReservationTransactionDto: CreateReservationTransactionDto,
    type: TransactionType,
    method: PaymentMethod,
    user: User,
    reservation: Reservation,
    manager?: EntityManager,
  ): Promise<ReservationTransaction> {
    const repo = manager
      ? manager.getRepository(ReservationTransaction)
      : this.reservationTransactionRepository;

    const newTransaction = repo.create({
      ...createReservationTransactionDto,
      type,
      method,
      user,
      reservation,
    });

    return await repo.save(newTransaction);
  }

  async createManualForOwner(
    createReservationTransactionDto: CreateReservationTransactionDto,
    user: User,
  ) {
    const reservation = await this.reservationsService.findOne(
      createReservationTransactionDto.reservationId,
    );

    if (reservation.arena.owner.id !== user.id) {
      throw ApiResponseUtil.throwError(
        'errors.reservation.not_allowed_to_add_transaction',
        'NOT_RESERVATION_OWNER',
        403,
      );
    }

    return await this.create(
      createReservationTransactionDto,
      TransactionType.MANUAL,
      PaymentMethod.MANUAL,
      user,
      reservation,
    );
  }

  async createForUser(
    createReservationTransactionDto: CreateReservationTransactionDto,
    user: User,
    manager?: EntityManager,
  ) {
    const reservation = await this.reservationsService.findOne(
      createReservationTransactionDto.reservationId,
      manager,
    );
    return await this.create(
      createReservationTransactionDto,
      TransactionType.DEPOSIT,
      PaymentMethod.WALLET,
      user,
      reservation,
      manager,
    );
  }

  private async fetchAndValidateTransaction(
    transactionId: string,
    user: User,
  ): Promise<ReservationTransaction | never> {
    const transaction = await this.reservationTransactionRepository.findOne({
      where: { id: transactionId, user: { id: user.id } },
      relations: {
        reservation: {
          arena: {
            owner: true,
          },
        },
      },
    });
    if (!transaction) {
      throw ApiResponseUtil.throwError(
        'errors.reservation_transaction.not_found',
        'RESERVATION_TRANSACTION_NOT_FOUND',
        404,
      );
    }
    if (transaction.user.id !== user.id) {
      throw ApiResponseUtil.throwError(
        'errors.reservation_transaction.not_owner',
        'NOT_TRANSACTION_OWNER',
        403,
      );
    }
    if (transaction.stage == TransactionStage.CANCELED) {
      throw ApiResponseUtil.throwError(
        'errors.reservation_transaction.canceled',
        'RESERVATION_TRANSACTION_CANCELED',
        400,
      );
    }
    return transaction;
  }

  async update(
    transactionId: string,
    updateDto: UpdateReservationTransactionDto,
    user: User,
  ): Promise<ReservationTransaction | never> {
    const transaction = await this.fetchAndValidateTransaction(
      transactionId,
      user,
    );
    if (updateDto.stage && transaction.stage === updateDto.stage) {
      throw ApiResponseUtil.throwError(
        'errors.reservation_transaction.same_stage',
        'SAME_STAGE',
        400,
      );
    }

    transaction.amount = updateDto.amount ?? transaction.amount;
    transaction.stage = updateDto.stage ?? transaction.stage;
    return await this.reservationTransactionRepository.save(transaction);
  }

  async cancel(
    transactionId: string,
    user: User,
  ): Promise<ReservationTransaction | never> {
    const transaction = await this.fetchAndValidateTransaction(
      transactionId,
      user,
    );
    transaction.stage = TransactionStage.CANCELED;
    return await this.reservationTransactionRepository.save(transaction);
  }
}
