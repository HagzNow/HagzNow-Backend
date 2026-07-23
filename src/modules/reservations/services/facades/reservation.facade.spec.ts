import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';
import { PaymentMethod } from 'src/common/interfaces/transactions/payment-methods.interface';
import { Reservation } from '../../entities/reservation.entity';
import { ReservationStatus } from '../../interfaces/reservation-status.interface';
import { ReservationFacade } from './reservation.facade';

describe('ReservationFacade amount workflows', () => {
  it('uses the deposit total for an online wallet booking', async () => {
    const context = createFacadeContext();

    const reservation = await context.facade.createReservationWorkflow(
      context.dto as never,
      context.user as never,
    );

    expect(
      context.walletsService.validateSufficientBalance,
    ).toHaveBeenCalledWith(
      context.user.id,
      context.amounts.depositTotalAmount,
      context.manager,
    );
    expect(context.reservationPaymentService.hold).toHaveBeenCalledWith(
      context.paymentContext,
      context.manager,
    );
    expect(
      context.reservationTransactionsService.createOnlineTransaction,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: context.amounts.depositTotalAmount,
        stage: TransactionStage.INSTANT,
      }),
      context.user,
      reservation,
      context.manager,
    );
    expect(reservation.totalAmount).toBe(context.amounts.totalAmount);
  });

  it('validates and records manual payment against the full total', async () => {
    const context = createFacadeContext();
    context.reservationPolicy.resolveCustomer.mockResolvedValue(
      context.customer,
    );
    context.reservationValidator.validateInitialPaidAmount.mockReturnValue(90);

    await context.facade.createManualReservationWorkflow(
      { ...context.dto, paidAmount: 90 } as never,
      context.user as never,
    );

    expect(
      context.reservationValidator.validateInitialPaidAmount,
    ).toHaveBeenCalledWith(90, context.amounts.totalAmount);
    expect(
      context.reservationTransactionsService.createInitialManualPayment,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 90,
        stage: TransactionStage.INSTANT,
      }),
      context.user,
      expect.any(Reservation),
      context.manager,
    );
  });
});

function createFacadeContext() {
  const manager = {};
  const user = { id: 'user-id' };
  const customer = { id: user.id };
  const arena = {
    id: 'arena-id',
    owner: { id: 'owner-id' },
  };
  const courts = [{ id: 'court-id', arena }];
  const amounts = {
    playTotalAmount: 200,
    extrasTotalAmount: 40,
    totalAmount: 240,
    playDepositRate: 0.25,
    extrasDepositRate: 0.5,
    playDepositAmount: 50,
    extrasDepositAmount: 20,
    depositTotalAmount: 70,
  };
  const dto = {
    date: '2030-01-01',
    slots: [{ courtId: 'court-id', slots: [10, 11] }],
    extras: [],
  };
  const paymentContext = {
    referenceId: 'reservation-id',
    amounts: { player: 70, owner: 63, admin: 7 },
  };
  const reservation = Object.assign(new Reservation(), {
    id: 'reservation-id',
    arena,
    customer,
    status: ReservationStatus.HOLD,
    paymentMethod: PaymentMethod.WALLET,
    ...amounts,
  });
  const transactionManager = {
    run: jest.fn((callback) => callback(manager)),
  };
  const reservationsService = {
    createReservation: jest.fn(async (...args) => {
      const status = args[5] ?? ReservationStatus.HOLD;
      const paymentMethod = args[6] ?? PaymentMethod.WALLET;
      return Object.assign(new Reservation(), reservation, {
        status,
        paymentMethod,
      });
    }),
  };
  const reservationPolicy = {
    extractCourtsAndArenaAndExtras: jest.fn().mockResolvedValue({
      courts,
      arena,
      extras: [],
    }),
    buildPaymentContext: jest.fn().mockReturnValue(paymentContext),
    resolveCustomer: jest.fn(),
  };
  const reservationValidator = {
    validateDateAndSlots: jest.fn(),
    validateInitialPaidAmount: jest.fn(),
  };
  const reservationPricingService = {
    calculateReservationAmounts: jest.fn().mockReturnValue(amounts),
  };
  const reservationTransactionsService = {
    createOnlineTransaction: jest.fn().mockResolvedValue({ id: 'online-tx' }),
    createInitialManualPayment: jest
      .fn()
      .mockResolvedValue({ id: 'manual-tx' }),
  };
  const reservationExtrasService = {};
  const arenasService = {
    validateSlotsAreInAllowedRange: jest.fn(),
    ensureOwner: jest.fn(),
  };
  const courtSlotsService = {
    validateSlotsAreAvailable: jest.fn(),
    createSlots: jest.fn().mockResolvedValue([]),
  };
  const customersService = {
    findOneById: jest.fn().mockResolvedValue(customer),
  };
  const walletsService = {
    validateSufficientBalance: jest.fn(),
  };
  const reservationPaymentService = {
    hold: jest.fn(),
  };
  const producer = {
    scheduleSettlementJob: jest.fn(),
  };
  const eventEmitter = {
    emit: jest.fn(),
  };
  const facade = new ReservationFacade(
    transactionManager as never,
    reservationsService as never,
    reservationPolicy as never,
    reservationValidator as never,
    reservationPricingService as never,
    reservationTransactionsService as never,
    reservationExtrasService as never,
    arenasService as never,
    courtSlotsService as never,
    customersService as never,
    walletsService as never,
    reservationPaymentService as never,
    producer as never,
    eventEmitter as never,
  );

  return {
    facade,
    manager,
    user,
    customer,
    amounts,
    dto,
    paymentContext,
    walletsService,
    reservationPaymentService,
    reservationPolicy,
    reservationValidator,
    reservationTransactionsService,
  };
}
