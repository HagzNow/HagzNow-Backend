import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { ReservationTransaction } from './entities/reservation-transaction.entity';
import { CreateReservationTransactionDto } from './dto/create-reservation-transaction.dto';
import { TransactionType } from 'src/common/interfaces/transactions/transaction-type.interface';
import { PaymentMethod } from 'src/common/interfaces/transactions/payment-methods.interface';
import { User } from '../users/entities/user.entity';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { UpdateReservationTransactionDto } from './dto/update-reservation-transaction.dto';
import { ReservationExtrasService } from '../reservation-extras/reservation-extras.service';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ArenaExtraWithQuantity } from '../arenas/types/arena-extra-with-quantity.type';
import { TransactionManager } from '../common/database/transaction-manager.service';

type PaidAmountTransaction = Pick<ReservationTransaction, 'amount' | 'stage'>;

@Injectable()
export class ReservationTransactionsService {
  private readonly paidStages = new Set<TransactionStage>([
    TransactionStage.INSTANT,
    TransactionStage.SETTLED,
  ]);

  constructor(
    private readonly transactionManager: TransactionManager,
    @InjectRepository(ReservationTransaction)
    private readonly transactionRepo: Repository<ReservationTransaction>,
    private readonly reservationExtrasService: ReservationExtrasService,
  ) {}

  public async createInitialManualPayment(
    dto: CreateReservationTransactionDto,
    user: User,
    reservation: Reservation,
    manager: EntityManager,
  ): Promise<ReservationTransaction> {
    return await this.createTransactionRecord(
      dto,
      TransactionType.PAYMENT,
      PaymentMethod.MANUAL,
      TransactionStage.INSTANT,
      user,
      reservation,
      manager,
    );
  }

  public async createOnlineTransaction(
    dto: CreateReservationTransactionDto,
    user: User,
    reservation: Reservation,
    manager: EntityManager,
  ): Promise<ReservationTransaction> {
    return this.createTransactionRecord(
      dto,
      TransactionType.PAYMENT,
      PaymentMethod.WALLET,
      TransactionStage.INSTANT,
      user,
      reservation,
      manager,
    );
  }

  public async createOnFieldTransaction(
    dto: CreateReservationTransactionDto,
    user: User,
    reservation: Reservation,
    manager: EntityManager,
    resolvedExtras: ArenaExtraWithQuantity[] = [],
  ): Promise<ReservationTransaction> {
    return this.createTransactionRecord(
      dto,
      TransactionType.MANUAL,
      PaymentMethod.MANUAL,
      dto.stage,
      user,
      reservation,
      manager,
      true,
      resolvedExtras,
    );
  }

  /**
   * Pure, atomic function to store transaction records + link items.
   * Accepts pre-calculated values and writes straight to the database.
   */
  private async createTransactionRecord(
    dto: CreateReservationTransactionDto,
    type: TransactionType,
    method: PaymentMethod,
    stage: TransactionStage,
    user: User,
    reservation: Reservation,
    manager: EntityManager,
    affectsReservationTotals = false,
    resolvedExtras: ArenaExtraWithQuantity[] = [],
  ): Promise<ReservationTransaction> {
    const txRepo = manager.getRepository(ReservationTransaction);

    this.validateOwnership(type, reservation, user);

    // Resolve item structures via the dedicated domain service
    let arenaExtrasWithQuantity = resolvedExtras;
    if (dto.extras?.length && !arenaExtrasWithQuantity.length) {
      arenaExtrasWithQuantity =
        await this.reservationExtrasService.prepareExtrasForTransaction(
          reservation.arena.id,
          dto.extras,
          manager,
        );
    }

    // 🌟 Clean write: Save the exact amount provided by the workflow layer
    const { extras, ...transactionData } = dto;
    const savedTransaction = await txRepo.save(
      txRepo.create({
        ...transactionData,
        amount: Number(dto.amount),
        type,
        method,
        user,
        reservation,
        stage,
      }),
    );

    // Track item logs linked to this transaction record
    if (arenaExtrasWithQuantity.length) {
      savedTransaction.extras =
        await this.reservationExtrasService.createExtras(
          savedTransaction,
          arenaExtrasWithQuantity,
          manager,
        );
    }

    if (affectsReservationTotals) {
      await this.adjustReservationTotals(
        reservation,
        Number(savedTransaction.amount),
        manager,
      );
    }

    reservation.paidAmount = await this.synchronizePaidAmount(
      reservation.id,
      manager,
    );
    savedTransaction.reservation = reservation;

    return savedTransaction;
  }

  private validateOwnership(
    type: TransactionType,
    reservation: Reservation,
    user: User,
  ) {
    if (
      type === TransactionType.MANUAL &&
      reservation.arena.owner.id !== user.id
    ) {
      throw ApiResponseUtil.throwError(
        'errors.reservation.not_allowed_to_add_transaction',
        'NOT_RESERVATION_OWNER',
        403,
      );
    }
  }

  async cancelOnlinePaymentByReservationId(
    reservationId: string,
    manager: EntityManager,
  ): Promise<ReservationTransaction> {
    const transactionRepo = manager.getRepository(ReservationTransaction);
    const transaction = await transactionRepo.findOne({
      where: {
        reservation: { id: reservationId },
        type: TransactionType.PAYMENT,
        method: PaymentMethod.WALLET,
        stage: In([TransactionStage.INSTANT, TransactionStage.SETTLED]),
      },
      relations: {
        reservation: true,
        user: true,
        extras: { extra: true },
      },
    });

    if (!transaction) {
      throw ApiResponseUtil.throwError(
        'errors.reservation_transaction.not_found',
        'RESERVATION_TRANSACTION_NOT_FOUND',
        404,
      );
    }

    transaction.stage = TransactionStage.CANCELED;
    const savedTransaction = await transactionRepo.save(transaction);
    savedTransaction.reservation.paidAmount = await this.synchronizePaidAmount(
      reservationId,
      manager,
    );

    return savedTransaction;
  }

  private async fetchAndValidate(
    id: string,
    user: User,
    manager?: EntityManager,
  ): Promise<ReservationTransaction> {
    const transactionRepo = manager
      ? manager.getRepository(ReservationTransaction)
      : this.transactionRepo;
    const tx = await transactionRepo.findOne({
      where: { id },
      relations: {
        user: true,
        extras: { extra: true },
        reservation: { arena: { owner: true } },
      },
    });

    if (!tx) {
      throw ApiResponseUtil.throwError(
        'errors.reservation_transaction.not_found',
        'RESERVATION_TRANSACTION_NOT_FOUND',
        404,
      );
    }

    if (tx.reservation.arena.owner.id !== user.id) {
      throw ApiResponseUtil.throwError(
        'errors.reservation_transaction.not_owner',
        'NOT_TRANSACTION_OWNER',
        403,
      );
    }

    return tx;
  }

  async settleOnFieldTransaction(
    id: string,
    user: User,
  ): Promise<ReservationTransaction> {
    return this.transactionManager.run(async (manager) => {
      const transaction = await this.fetchAndValidate(id, user, manager);
      this.validatePendingOnFieldTransaction(transaction);

      transaction.stage = TransactionStage.SETTLED;
      const savedTransaction = await manager
        .getRepository(ReservationTransaction)
        .save(transaction);
      savedTransaction.reservation.paidAmount =
        await this.synchronizePaidAmount(transaction.reservation.id, manager);

      return savedTransaction;
    });
  }

  async update(
    id: string,
    updateDto: UpdateReservationTransactionDto,
    user: User,
  ): Promise<ReservationTransaction> {
    return this.transactionManager.run(async (manager) => {
      const tx = await this.fetchAndValidate(id, user, manager);
      this.validatePendingOnFieldTransaction(tx);

      if (tx.extras?.length && updateDto.amount !== undefined) {
        throw ApiResponseUtil.throwError(
          'errors.reservation_transaction.cannot_update_amount_attached_to_reservation_extras',
          'CANNOT_UPDATE_AMOUNT_ATTACHED_TO_RESERVATION_EXTRAS',
          400,
        );
      }

      const previousAmount = Number(tx.amount);
      tx.amount = updateDto.amount ?? tx.amount;
      tx.note = updateDto.note ?? tx.note;

      const savedTransaction = await manager
        .getRepository(ReservationTransaction)
        .save(tx);

      if (updateDto.amount !== undefined) {
        await this.adjustReservationTotals(
          tx.reservation,
          Number(tx.amount) - previousAmount,
          manager,
        );
      }

      savedTransaction.reservation.paidAmount =
        await this.synchronizePaidAmount(tx.reservation.id, manager);

      return savedTransaction;
    });
  }

  async cancelByTransactionId(
    transactionId: string,
    user: User,
  ): Promise<ReservationTransaction> {
    return this.transactionManager.run(async (manager) => {
      // Fetch the transaction and validate ownership and stage
      const tx = await this.fetchAndValidate(transactionId, user, manager);
      this.validatePendingOnFieldTransaction(tx);

      // Update the transaction stage to CANCELED
      tx.stage = TransactionStage.CANCELED;

      // Cancel all associated reservation extras
      await this.reservationExtrasService.cancelExtrasForTransactions(
        [transactionId],
        manager,
      );

      await this.adjustReservationTotals(
        tx.reservation,
        -Number(tx.amount),
        manager,
      );

      // Save the updated transaction
      const savedTransaction = await manager
        .getRepository(ReservationTransaction)
        .save(tx);
      savedTransaction.reservation.paidAmount =
        await this.synchronizePaidAmount(tx.reservation.id, manager);

      return savedTransaction;
    });
  }

  calculatePaidAmount(transactions: PaidAmountTransaction[]): number {
    const paidAmountInCents = transactions.reduce((total, transaction) => {
      if (!this.isPaid(transaction)) {
        return total;
      }

      return total + this.toCents(transaction.amount);
    }, 0);

    return paidAmountInCents / 100;
  }

  async synchronizePaidAmount(
    reservationId: string,
    manager: EntityManager,
  ): Promise<number> {
    const transactions = await manager
      .getRepository(ReservationTransaction)
      .find({
        where: { reservation: { id: reservationId } },
        select: { amount: true, stage: true },
      });
    const paidAmount = this.calculatePaidAmount(transactions);

    await manager
      .getRepository(Reservation)
      .update({ id: reservationId }, { paidAmount });

    return paidAmount;
  }

  private toCents(amount: number): number {
    return Math.round(Number(amount) * 100);
  }

  private isPaid(transaction: PaidAmountTransaction): boolean {
    return this.paidStages.has(transaction.stage);
  }

  private validatePendingOnFieldTransaction(
    transaction: ReservationTransaction,
  ): void {
    if (
      transaction.type !== TransactionType.MANUAL ||
      transaction.method !== PaymentMethod.MANUAL
    ) {
      throw ApiResponseUtil.throwError(
        'errors.reservation_transaction.not_on_field',
        'NOT_ON_FIELD_TRANSACTION',
        400,
      );
    }

    if (transaction.stage !== TransactionStage.PENDING) {
      throw ApiResponseUtil.throwError(
        'errors.reservation_transaction.not_pending',
        'TRANSACTION_NOT_PENDING',
        400,
      );
    }
  }

  private async adjustReservationTotals(
    reservation: Reservation,
    amountDifference: number,
    manager: EntityManager,
  ): Promise<void> {
    reservation.extrasTotalAmount =
      (this.toCents(reservation.extrasTotalAmount) +
        this.toCents(amountDifference)) /
      100;
    reservation.totalAmount =
      (this.toCents(reservation.totalAmount) + this.toCents(amountDifference)) /
      100;

    await manager.getRepository(Reservation).save(reservation);
  }
}
