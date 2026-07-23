import { Injectable } from '@nestjs/common';
import { TransactionManager } from 'src/modules/common/database/transaction-manager.service';
import { ReservationsService } from '../reservations.service';
import { ReservationTransactionsService } from '../../../reservation-transactions/reservation-transactions.service';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateReservationTransactionDto } from 'src/modules/reservation-transactions/dto/create-reservation-transaction.dto';
import { EntityManager } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';
import { PaymentMethod } from 'src/common/interfaces/transactions/payment-methods.interface';
import { ReservationPolicy } from '../reservation-policy.service';
import { ReservationValidator } from '../reservation-validator.service';
import { ReservationPricingService } from '../reservation-pricing.service';
import { ArenasService } from 'src/modules/arenas/arenas.service';
import { CourtSlotsService } from 'src/modules/court-slots/court-slots.service';
import { CustomersService } from 'src/modules/customerProfiles/customers.service';
import { WalletsService } from 'src/modules/wallets/services/wallets.service';
import { ReservationPaymentService } from '../reservation-payment.service';
import { ReservationsProducer } from '../../queue/reservations.producer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateReservationDto } from '../../dto/create-reservation.dto';
import { RESERVATION_CREATED } from 'src/common/event.constants';
import { CreateManualReservationDto } from '../../dto/create-manual-reservation.dto';
import { ReservationStatus } from '../../interfaces/reservation-status.interface';
import { ResolvedReservationContext } from '../../interfaces/resolved-reservation-context.interface';
import { ReservationExtrasService } from 'src/modules/reservation-extras/reservation-extras.service';

@Injectable()
export class ReservationFacade {
  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly reservationsService: ReservationsService,
    private readonly reservationPolicy: ReservationPolicy,
    private readonly reservationValidator: ReservationValidator,
    private readonly reservationPricingService: ReservationPricingService,
    private readonly reservationTransactionsService: ReservationTransactionsService,
    private readonly reservationExtrasService: ReservationExtrasService,
    private readonly arenasService: ArenasService,
    private readonly courtSlotsService: CourtSlotsService,
    private readonly customersService: CustomersService,
    private readonly walletsService: WalletsService,
    private readonly reservationPaymentService: ReservationPaymentService,
    private readonly producer: ReservationsProducer,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  // #region Normal
  /**
   * Workflow 1: Secure Online Booking via Wallet
   */
  async createReservationWorkflow(
    dto: CreateReservationDto,
    user: User,
  ): Promise<Reservation> {
    return this.transactionManager.run(async (manager: EntityManager) => {
      // 1. Core Identity extraction for standard mobile/web application checkouts
      const customer = await this.customersService.findOneById(user.id);

      // 2. Resolve and Validate the Shared Domain Context
      const context = await this.resolveAndValidateBookingContext(dto, manager);
      const { arena, amounts, courts } = context;

      // 3. Validate User Wallet Liquidity (Online Exclusive)
      await this.walletsService.validateSufficientBalance(
        user.id,
        amounts.depositTotalAmount,
        manager,
      );

      // 4. Core Persistence
      const reservation = await this.reservationsService.createReservation(
        dto,
        arena,
        amounts,
        customer,
        manager,
      );

      // 5. Secure funds before recording the payment as collected
      const paymentContext =
        this.reservationPolicy.buildPaymentContext(reservation);
      await this.reservationPaymentService.hold(paymentContext, manager);

      // 6. Downstream Financial Ledger Tracking
      const initialTx =
        await this.reservationTransactionsService.createOnlineTransaction(
          {
            amount: amounts.depositTotalAmount,
            stage: TransactionStage.INSTANT,
            extras: dto.extras,
          } as CreateReservationTransactionDto,
          user,
          reservation,
          manager,
        );
      reservation.transactions = [initialTx];

      // 7. Build Scheduling Allocation Slots
      reservation.slots = await this.courtSlotsService.createSlots(
        dto.slots,
        reservation,
        dto.date,
        courts,
        manager,
      );

      // 8. Schedule escrow settlement
      await this.producer.scheduleSettlementJob(reservation);

      // 9. System Dispatch Notify
      this.eventEmitter.emit(RESERVATION_CREATED, reservation);

      return reservation;
    });
  }
  // #endregion

  // #region Manual
  /**
   * Workflow 2: Manual Offline Booking (Created directly by Arena Owner)
   */
  async createManualReservationWorkflow(
    dto: CreateManualReservationDto,
    user: User,
  ): Promise<Reservation> {
    return this.transactionManager.run(async (manager: EntityManager) => {
      // 1. Core Identity resolution for optional/walk-in customer logs
      const customer = await this.reservationPolicy.resolveCustomer(dto);

      // 2. Resolve and Validate the Shared Domain Context
      const context = await this.resolveAndValidateBookingContext(dto, manager);
      const { arena, amounts, courts } = context;
      const initialPaidAmount =
        this.reservationValidator.validateInitialPaidAmount(
          dto.paidAmount,
          amounts.totalAmount,
        );

      // 3. Assert Ownership Rights (Manual Booking Exclusive)
      this.arenasService.ensureOwner(arena, user);

      // 4. Core Persistence with Custom Flags
      const reservation = await this.reservationsService.createReservation(
        dto,
        arena,
        amounts,
        customer,
        manager,
        ReservationStatus.CONFIRMED,
        PaymentMethod.MANUAL,
      );

      // 5. Record the initial manual payment as collected immediately
      const initialTx =
        await this.reservationTransactionsService.createInitialManualPayment(
          {
            amount: initialPaidAmount,
            stage: TransactionStage.INSTANT,
            extras: dto.extras,
          } as CreateReservationTransactionDto,
          user,
          reservation,
          manager,
        );
      reservation.transactions = [initialTx];

      // 6. Build Scheduling Allocation Slots
      reservation.slots = await this.courtSlotsService.createSlots(
        dto.slots,
        reservation,
        dto.date,
        courts,
        manager,
      );

      return reservation;
    });
  }
  // #endregion

  // #region Cancellation
  async cancelReservationWorkflow(
    reservationId: string,
    user: User,
  ): Promise<boolean> {
    return this.transactionManager.run(async (manager: EntityManager) => {
      // Remove from the settlement queue
      await this.producer.removeSettlement(reservationId);

      // Load reservation & update its status
      const reservation = await this.reservationsService.findOneWithRelations(
        reservationId,
        manager,
      );
      // Validate status and ownership for cancellation
      await this.reservationValidator.validateStatusAndOwnershipForCancellation(
        reservation,
        user,
      );
      // Validate the transaction is in HOLD stage and belongs to this reservation
      await this.reservationValidator.validateHeldTransaction(
        reservation,
        manager,
      );

      // Update reservation status to CANCELED
      reservation.status = ReservationStatus.CANCELED;

      // Mark all slots as canceled
      await this.courtSlotsService.cancelSlots(reservation.slots, manager);

      // Mark all extras as canceled
      await this.reservationExtrasService.cancelAllExtras(
        reservation.id,
        manager,
      );

      // build payment context
      const paymentContext =
        this.reservationPolicy.buildPaymentContext(reservation);

      await manager.getRepository(Reservation).save(reservation);

      await this.reservationPaymentService.refund(paymentContext, manager);

      await this.reservationTransactionsService.cancelOnlinePaymentByReservationId(
        reservation.id,
        manager,
      );

      return true;
    });
  }
  // #endregion

  // #region Resolver
  // =========================================================================
  // EXTRACTED REUSABLE HELPER METHODS
  // =========================================================================

  /**
   * Shared atomic block containing validation pipelines and pricing compilation.
   */
  private async resolveAndValidateBookingContext(
    dto: CreateReservationDto | CreateManualReservationDto,
    manager: EntityManager,
  ): Promise<ResolvedReservationContext> {
    // Flatten and structurally parse inputs
    const slots = dto.slots
      .map(({ slots }) => slots)
      .flat()
      .map(Number);
    this.reservationValidator.validateDateAndSlots(dto.date, slots);

    // Dynamic data loading snapshots
    const {
      courts,
      arena,
      extras: arenaExtras,
    } = await this.reservationPolicy.extractCourtsAndArenaAndExtras(
      dto,
      manager,
    );

    // Validation Guard Checks
    this.arenasService.validateSlotsAreInAllowedRange(slots, arena);
    await this.courtSlotsService.validateSlotsAreAvailable(
      dto.slots,
      dto.date,
      manager,
    );

    // Pricing Compilation Engine evaluation
    const amounts = this.reservationPricingService.calculateReservationAmounts(
      arena,
      slots,
      arenaExtras,
    );

    return { slots, courts, arena, arenaExtras, amounts };
  }
  // #endregion

  // #region Settlement
  /**
   * Workflow 3: Escrow Settlement (Triggered asynchronously or by system events)
   * Releases funds from escrow hold and confirms the reservation.
   */
  async settleReservationWorkflow(reservationId: string): Promise<Reservation> {
    return this.transactionManager.run(async (manager: EntityManager) => {
      // 1. Core data snapshot loading & policy extraction
      // ⚠️ Note: Ensure loadAndValidateHeldReservation exists on reservationsService or your facade helpers
      const reservation =
        await this.reservationsService.loadAndValidateHeldReservation(
          reservationId,
          manager,
        );
      this.reservationValidator.validateExistingUser(reservation);

      // 2. Transition Aggregate Root state to confirmed playability
      reservation.status = ReservationStatus.CONFIRMED;

      // 3. Coordinate actual financial asset settlement (Wallet engine liquidity release)
      const paymentContext =
        this.reservationPolicy.buildPaymentContext(reservation);

      // 4. Execute the settlement logic within the same transaction manager context
      await this.reservationPaymentService.settle(paymentContext, manager);

      // 5. Commit state modifications to the database
      return await manager.getRepository(Reservation).save(reservation);
    });
  }
  // #endregion

  // #region OnField
  /**
   * Workflow 4: On-Field Transaction Addition (Manual Extra Charges)
   * Allows arena owners to add additional charges to an existing reservation, creating a new transaction and adjusting the reservation's total amount accordingly.
   * This workflow ensures that the new transaction is created and the reservation's total amount is updated atomically.
   * @param reservationId - The ID of the reservation to which the transaction will be added.
   */
  async addOnFieldTransactionWorkflow(
    reservationId: string,
    dto: CreateReservationTransactionDto,
    user: User,
  ) {
    // The Facade opens the transaction window
    return this.transactionManager.run(async (manager) => {
      // Fetch the reservation to ensure it exists and is valid for transaction creation
      const reservation = await this.reservationsService.findOneWithRelations(
        reservationId,
        manager,
      );

      const resolvedExtras = dto.extras?.length
        ? await this.reservationExtrasService.prepareExtrasForTransaction(
            reservation.arena.id,
            dto.extras,
            manager,
          )
        : [];
      const transactionAmount =
        this.reservationPricingService.calculateBonusTransactionAmount(
          dto.amount,
          dto.extras,
          resolvedExtras,
        );

      return this.reservationTransactionsService.createOnFieldTransaction(
        { ...dto, amount: transactionAmount },
        user,
        reservation,
        manager,
        resolvedExtras,
      );
    });
  }
  // #endregion
}
