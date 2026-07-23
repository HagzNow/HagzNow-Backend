import { HttpException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';
import { TransactionType } from 'src/common/interfaces/transactions/transaction-type.interface';
import { PaymentMethod } from 'src/common/interfaces/transactions/payment-methods.interface';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { ReservationTransaction } from './entities/reservation-transaction.entity';
import { ReservationTransactionsService } from './reservation-transactions.service';
import { User } from '../users/entities/user.entity';

describe('ReservationTransactionsService', () => {
  it('counts only instant and settled transactions as paid', () => {
    const { service } = createTestContext();

    const paidAmount = service.calculatePaidAmount([
      createTransaction(100, TransactionStage.SETTLED),
      createTransaction(25.5, TransactionStage.INSTANT),
      createTransaction(
        80,
        TransactionStage.PENDING,
        TransactionType.PAYMENT,
        PaymentMethod.WALLET,
      ),
      createTransaction(40, TransactionStage.CANCELED),
    ]);

    expect(paidAmount).toBe(125.5);
  });

  it('calculates decimal money using cents', () => {
    const { service } = createTestContext();

    expect(
      service.calculatePaidAmount([
        createTransaction(0.1, TransactionStage.SETTLED),
        createTransaction(0.2, TransactionStage.INSTANT),
      ]),
    ).toBe(0.3);
  });

  it.each([TransactionStage.PENDING, TransactionStage.INSTANT])(
    'creates an on-field %s transaction with consistent totals',
    async (stage) => {
      const reservation = createReservation();
      const context = createTestContext();

      const transaction = await context.service.createOnFieldTransaction(
        { amount: 20, stage },
        context.owner,
        reservation,
        context.manager,
      );

      expect(transaction.stage).toBe(stage);
      expect(reservation.totalAmount).toBe(120);
      expect(reservation.extrasTotalAmount).toBe(20);
      expect(reservation.depositTotalAmount).toBe(25);
      expect(reservation.paidAmount).toBe(
        stage === TransactionStage.INSTANT ? 20 : 0,
      );
    },
  );

  it('forces online and initial manual payments to instant', async () => {
    const reservation = createReservation();
    const context = createTestContext();

    const onlineTransaction = await context.service.createOnlineTransaction(
      { amount: 100, stage: TransactionStage.PENDING },
      context.owner,
      reservation,
      context.manager,
    );
    const manualTransaction = await context.service.createInitialManualPayment(
      { amount: 50, stage: TransactionStage.PENDING },
      context.owner,
      reservation,
      context.manager,
    );

    expect(onlineTransaction.stage).toBe(TransactionStage.INSTANT);
    expect(manualTransaction.stage).toBe(TransactionStage.INSTANT);
    expect(onlineTransaction.type).toBe(TransactionType.PAYMENT);
    expect(manualTransaction.type).toBe(TransactionType.PAYMENT);
  });

  it('settles only a pending on-field transaction', async () => {
    const reservation = createReservation({ totalAmount: 120 });
    const transaction = createTransaction(
      20,
      TransactionStage.PENDING,
      TransactionType.MANUAL,
      PaymentMethod.MANUAL,
      reservation,
    );
    const context = createTestContext([transaction]);

    const settled = await context.service.settleOnFieldTransaction(
      transaction.id,
      context.owner,
    );

    expect(settled.stage).toBe(TransactionStage.SETTLED);
    expect(settled.reservation.paidAmount).toBe(20);
    expect(settled.reservation.totalAmount).toBe(120);
    expect(settled.reservation.depositTotalAmount).toBe(25);
  });

  it('rejects settling an instant on-field transaction', async () => {
    const transaction = createTransaction(
      20,
      TransactionStage.INSTANT,
      TransactionType.MANUAL,
      PaymentMethod.MANUAL,
      createReservation({ totalAmount: 120, paidAmount: 20 }),
    );
    const context = createTestContext([transaction]);

    await expect(
      context.service.settleOnFieldTransaction(transaction.id, context.owner),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('reverses totals when canceling a pending on-field transaction', async () => {
    const reservation = createReservation({
      totalAmount: 120,
      extrasTotalAmount: 20,
    });
    const transaction = createTransaction(
      20,
      TransactionStage.PENDING,
      TransactionType.MANUAL,
      PaymentMethod.MANUAL,
      reservation,
    );
    const context = createTestContext([transaction]);

    const canceled = await context.service.cancelByTransactionId(
      transaction.id,
      context.owner,
    );

    expect(canceled.stage).toBe(TransactionStage.CANCELED);
    expect(reservation.totalAmount).toBe(100);
    expect(reservation.extrasTotalAmount).toBe(0);
    expect(reservation.depositTotalAmount).toBe(25);
    expect(
      context.reservationExtrasService.cancelExtrasForTransactions,
    ).toHaveBeenCalledWith([transaction.id], context.manager);
  });

  it('adjusts totals by the difference when updating a pending amount', async () => {
    const reservation = createReservation({
      totalAmount: 120,
      extrasTotalAmount: 20,
    });
    const transaction = createTransaction(
      20,
      TransactionStage.PENDING,
      TransactionType.MANUAL,
      PaymentMethod.MANUAL,
      reservation,
    );
    const context = createTestContext([transaction]);

    await context.service.update(transaction.id, { amount: 30 }, context.owner);

    expect(reservation.totalAmount).toBe(130);
    expect(reservation.extrasTotalAmount).toBe(30);
    expect(reservation.depositTotalAmount).toBe(25);
  });
});

function createTestContext(initialTransactions: ReservationTransaction[] = []) {
  const transactions = [...initialTransactions];
  const transactionRepository = {
    create: jest.fn((data) => ({
      id: `tx-${transactions.length + 1}`,
      ...data,
    })),
    save: jest.fn(async (transaction: ReservationTransaction) => {
      const index = transactions.findIndex(({ id }) => id === transaction.id);
      if (index === -1) {
        transactions.push(transaction);
      } else {
        transactions[index] = transaction;
      }
      return transaction;
    }),
    find: jest.fn(async () => transactions),
    findOne: jest.fn(async ({ where: { id } }) =>
      transactions.find((transaction) => transaction.id === id),
    ),
  };
  const reservationRepository = {
    save: jest.fn(async (reservation: Reservation) => reservation),
    update: jest.fn(async ({ id }, update) => {
      for (const transaction of transactions) {
        if (transaction.reservation.id === id) {
          Object.assign(transaction.reservation, update);
        }
      }
    }),
  };
  const manager = {
    getRepository: jest.fn((entity) =>
      entity === ReservationTransaction
        ? transactionRepository
        : reservationRepository,
    ),
  } as unknown as EntityManager;
  const transactionManager = {
    run: jest.fn((callback) => callback(manager)),
  };
  const reservationExtrasService = {
    prepareExtrasForTransaction: jest.fn(),
    createExtras: jest.fn(),
    cancelExtrasForTransactions: jest.fn(),
  };
  const service = new ReservationTransactionsService(
    transactionManager as never,
    transactionRepository as never,
    reservationExtrasService as never,
  );
  const owner = { id: 'owner-id' } as User;

  return {
    service,
    manager,
    owner,
    transactionRepository,
    reservationRepository,
    reservationExtrasService,
  };
}

function createReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: 'reservation-id',
    totalAmount: 100,
    extrasTotalAmount: 0,
    depositTotalAmount: 25,
    paidAmount: 0,
    arena: { owner: { id: 'owner-id' } },
    ...overrides,
  } as Reservation;
}

function createTransaction(
  amount: number | string,
  stage: TransactionStage,
  type: TransactionType = TransactionType.MANUAL,
  method: PaymentMethod = PaymentMethod.MANUAL,
  reservation: Reservation = createReservation(),
): ReservationTransaction {
  return {
    id: 'transaction-id',
    amount,
    stage,
    type,
    method,
    reservation,
    user: { id: 'owner-id' },
    extras: [],
  } as ReservationTransaction;
}
