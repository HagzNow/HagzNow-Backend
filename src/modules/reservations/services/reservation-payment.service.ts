import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { WalletsService } from '../../wallets/wallets.service';
import { EntityManager } from 'typeorm';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';
import { TransactionType } from 'src/common/interfaces/transactions/transaction-type.interface';
import { WalletTransactionService } from 'src/modules/wallets/wallet-transaction.service';
import { User } from 'src/modules/users/entities/user.entity';
import { ReservationPaymentContext } from '../interfaces/reservation-payment.context';
import { ReservationTransactionsService } from 'src/modules/reservation-transactions/reservation-transactions.service';

@Injectable()
export class ReservationPaymentService {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly walletTransactionService: WalletTransactionService,
    @Inject(forwardRef(() => ReservationTransactionsService))
    private readonly reservationTransactionsService: ReservationTransactionsService,
  ) {}
  async hold(ctx: ReservationPaymentContext, manager: EntityManager) {
    await this.walletTransactionService.create(
      {
        amount: ctx.amounts.player,
        stage: TransactionStage.HOLD,
        type: TransactionType.PAYMENT,
        referenceId: ctx.referenceId,
      },
      { id: ctx.userId } as User,
      manager,
    );

    await this.walletsService.lockAmount(
      ctx.userId,
      ctx.amounts.player,
      manager,
    );

    await this.walletsService.addToHeldAmount(
      ctx.ownerId,
      ctx.amounts.owner,
      manager,
    );

    await this.walletsService.addToHeldAmount(
      ctx.adminId,
      ctx.amounts.admin,
      manager,
    );
  }

  async settle(ctx: ReservationPaymentContext, manager: EntityManager) {
    // Update HOLD → PROCESSED
    await this.walletTransactionService.updateByReferenceId(
      ctx.referenceId,
      TransactionStage.PROCESSED,
      manager,
    );

    // Create SETTLED tx for user
    await this.walletTransactionService.create(
      {
        amount: Number(ctx.amounts.player),
        type: TransactionType.PAYMENT,
        referenceId: ctx.referenceId,
        stage: TransactionStage.SETTLED,
      },
      { id: ctx.userId } as User,
      manager,
    );

    // Release held amounts
    await this.walletsService.unlockAmount(
      ctx.userId,
      Number(ctx.amounts.player),
      manager,
    );

    const ownerAmount = ctx.amounts.owner;
    const adminAmount = ctx.amounts.admin;
    // Release to owner & add to balance
    await this.walletsService.releaseHeldAmount(
      ctx.ownerId,
      ownerAmount,
      manager,
    );

    await this.walletTransactionService.create(
      {
        amount: ownerAmount,
        type: TransactionType.DEPOSIT,
        stage: TransactionStage.INSTANT,
        referenceId: ctx.referenceId,
      },
      { id: ctx.ownerId } as User,
      manager,
    );

    // Release to admin & add to balance
    await this.walletsService.releaseHeldAmount(
      ctx.adminId,
      adminAmount,
      manager,
    );

    // Create tx for admin
    await this.walletTransactionService.create(
      {
        amount: adminAmount,
        type: TransactionType.DEPOSIT,
        stage: TransactionStage.INSTANT,
        referenceId: ctx.referenceId,
      },
      { id: ctx.adminId } as User,
      manager,
    );

    // Create transactions for reservation
    await this.reservationTransactionsService.createForUser(
      {
        reservationId: ctx.referenceId,
        stage: TransactionStage.INSTANT,
        amount: ctx.amounts.player,
      },
      { id: ctx.userId } as User,
      manager,
    );
  }

  async refund(ctx: ReservationPaymentContext, manager: EntityManager) {
    // Update HOLD → PROCESSED
    await this.walletTransactionService.updateByReferenceId(
      ctx.referenceId,
      TransactionStage.PROCESSED,
      manager,
    );

    // Create REFUND tx for player
    await this.walletTransactionService.create(
      {
        amount: Number(ctx.amounts.player),
        type: TransactionType.REFUND,
        referenceId: ctx.referenceId,
        stage: TransactionStage.REFUND,
      },
      { id: ctx.userId } as User,
      manager,
    );

    // Refund user wallet
    await this.walletsService.releaseHeldAmount(
      ctx.userId,
      Number(ctx.amounts.player),
      manager,
    );

    // reduce held amounts from owner & admin
    await this.walletsService.removeFromHeldAmount(
      ctx.ownerId,
      Number(ctx.amounts.owner),
      manager,
    );
    await this.walletsService.removeFromHeldAmount(
      ctx.adminId,
      Number(ctx.amounts.admin),
      manager,
    );
    await this.walletTransactionService.create(
      {
        amount: Number(ctx.amounts.player),
        type: TransactionType.REFUND,
        referenceId: ctx.referenceId,
        stage: TransactionStage.PROCESSED,
      },
      { id: ctx.userId } as User,
      manager,
    );
  }
}
