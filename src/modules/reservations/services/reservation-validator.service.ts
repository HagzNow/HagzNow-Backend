import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { AdminConfig } from 'src/modules/admin/admin.config';
import { ArenasService } from 'src/modules/arenas/arenas.service';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { WalletTransactionService } from 'src/modules/wallets/services/wallet-transaction.service';
import { EntityManager, Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../interfaces/reservation-status.interface';

@Injectable()
export class ReservationValidator {
  constructor(
    private readonly arenasService: ArenasService,
    private readonly walletTransactionService: WalletTransactionService,
    private readonly usersService: UsersService,
    private readonly adminConfig: AdminConfig,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  validateReservationId(reservationId: string): void {
    if (!reservationId) {
      ApiResponseUtil.throwError(
        'errors.reservation.id_required',
        'RESERVATION_ID_REQUIRED',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validateReservationExists(reservation: Reservation | null): Reservation {
    if (!reservation) {
      ApiResponseUtil.throwError(
        'errors.reservation.not_found',
        'RESERVATION_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    return reservation;
  }

  validateDateAndSlots(date: string, slots: number[]): void | never {
    const now = DateTime.now().setZone('Africa/Cairo');
    const reservationDate = DateTime.fromISO(date, {
      zone: 'Africa/Cairo',
    });
    if (reservationDate < now.startOf('day')) {
      return ApiResponseUtil.throwError(
        'errors.reservation.past_time',
        'RESERVATION_DATE_IN_PAST',
        HttpStatus.BAD_REQUEST,
      );
    }

    const currentHour = now.hour;
    if (
      slots.some((hour) => Number(hour) < currentHour) &&
      reservationDate.hasSame(now, 'day')
    ) {
      return ApiResponseUtil.throwError(
        'errors.reservation.past_time',
        'RESERVATION_SLOT_IN_PAST',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validateExistingUser(reservation: Reservation): User | never {
    const user = reservation.customer?.user;
    if (!user) {
      ApiResponseUtil.throwError(
        'errors.customer.user_not_found',
        'CUSTOMER_USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  validateInitialPaidAmount(paidAmount: number, totalAmount: number): number {
    const normalizedPaidAmount = this.toCents(paidAmount) / 100;

    if (
      !Number.isFinite(normalizedPaidAmount) ||
      normalizedPaidAmount < 0 ||
      this.toCents(paidAmount) > this.toCents(totalAmount)
    ) {
      ApiResponseUtil.throwError(
        'errors.reservation.paid_amount_exceeds_total',
        'PAID_AMOUNT_EXCEEDS_TOTAL',
        HttpStatus.BAD_REQUEST,
      );
    }

    return normalizedPaidAmount;
  }

  async validateHeldTransaction(
    reservation: Reservation,
    manager: EntityManager,
  ): Promise<void | never> {
    const transaction =
      await this.walletTransactionService.findOneByReferenceId(
        reservation.id,
        manager,
      );

    if (!transaction || transaction.stage !== TransactionStage.HOLD) {
      return ApiResponseUtil.throwError(
        'errors.reservation.not_in_hold',
        'WALLET_TRANSACTION_NOT_FOUND_OR_INVALID_STAGE',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async validateStatusAndOwnershipForCancellation(
    reservation: Reservation,
    user: User,
  ): Promise<void | never> {
    if (reservation.status === ReservationStatus.CANCELED) {
      return ApiResponseUtil.throwError(
        'errors.reservation.already_canceled',
        'RESERVATION_ALREADY_CANCELED',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (reservation.customer.id !== user.id) {
      return ApiResponseUtil.throwError(
        'errors.general.unauthorized',
        'UNAUTHORIZED_ACCESS',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async validateCanViewReservationDetails(
    reservationId: string,
    user: User,
  ): Promise<void> {
    if (!user?.id) {
      ApiResponseUtil.throwError(
        'errors.general.forbidden',
        'FORBIDDEN',
        HttpStatus.FORBIDDEN,
      );
    }

    if (await this.usersService.isActiveAdmin(user.id)) {
      return;
    }

    const reservation = await this.findReservationAccessSnapshot(reservationId);
    const isCustomer =
      reservation.customer.id === user.id ||
      reservation.customer.userId === user.id ||
      reservation.customer.user?.id === user.id;
    const isArenaOwner = reservation.arena.owner.id === user.id;

    if (isCustomer || isArenaOwner) {
      return;
    }

    ApiResponseUtil.throwError(
      'errors.general.forbidden',
      'FORBIDDEN',
      HttpStatus.FORBIDDEN,
    );
  }

  async validateArenaOwnershipOrAdmin(
    arenaId: string,
    user: User,
  ): Promise<void | never> {
    const arena = await this.arenasService.findOne(arenaId);
    if (arena.owner.id === user.id) {
      return;
    }

    if (await this.usersService.isActiveAdmin(user.id)) {
      return;
    }

    return ApiResponseUtil.throwError(
      'errors.general.unauthorized',
      'UNAUTHORIZED_ACCESS',
      HttpStatus.UNAUTHORIZED,
    );
  }

  validatePreGameWindow(reservation: Reservation): void | never {
    const now = DateTime.now().setZone('Africa/Cairo');

    if (reservation.status === ReservationStatus.CANCELED) {
      return ApiResponseUtil.throwError(
        'errors.reservation.already_canceled',
        'RESERVATION_ALREADY_CANCELED',
        HttpStatus.BAD_REQUEST,
      );
    }

    const baseDateStr =
      typeof reservation.dateOfReservation === 'string'
        ? reservation.dateOfReservation
        : reservation.dateOfReservation.toISOString();

    const reservationStart = DateTime.fromISO(baseDateStr, {
      zone: 'Africa/Cairo',
    }).startOf('day');

    if (!reservation.slots || reservation.slots.length === 0) {
      return ApiResponseUtil.throwError(
        'errors.reservation.missing_slots_context',
        'RESERVATION_SLOTS_MISSING',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const slotHours = reservation.slots.map((slot) =>
      Number(slot.hour || slot),
    );
    const entryHour = Math.min(...slotHours);
    const exactPlayStartTime = reservationStart.set({
      hour: entryHour,
      minute: 0,
      second: 0,
    });
    const deadlineTime = exactPlayStartTime.minus({
      hours: this.adminConfig.modificationBufferHours,
    });

    if (now < deadlineTime) {
      return ApiResponseUtil.throwError(
        'errors.reservation.modification_window_not_open',
        'MODIFICATION_WINDOW_NOT_OPEN_YET',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (now > exactPlayStartTime) {
      return ApiResponseUtil.throwError(
        'errors.reservation.game_already_started',
        'GAME_ALREADY_STARTED',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async findReservationAccessSnapshot(
    reservationId: string,
  ): Promise<Reservation> {
    this.validateReservationId(reservationId);
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      loadEagerRelations: false,
      select: {
        id: true,
        customer: {
          id: true,
          userId: true,
          user: { id: true },
        },
        arena: {
          id: true,
          owner: { id: true },
        },
      },
      relations: {
        customer: { user: true },
        arena: { owner: true },
      },
    });

    return this.validateReservationExists(reservation);
  }

  private toCents(amount: number): number {
    return Math.round(Number(amount) * 100);
  }
}
