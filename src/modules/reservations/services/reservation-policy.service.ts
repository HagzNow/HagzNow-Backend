import { HttpStatus, Injectable } from '@nestjs/common';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { DateTime } from 'luxon';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { ArenaStatus } from 'src/modules/arenas/interfaces/arena-status.interface';
import { EntityManager, QueryRunner } from 'typeorm';
import { CreateManualReservationDto } from '../dto/create-manual-reservation.dto';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ArenasService } from '../../arenas/arenas.service';
import { TransactionStage } from 'src/modules/wallets/interfaces/transaction-stage.interface';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../interfaces/reservation-status.interface';
import { WalletTransactionService } from 'src/modules/wallets/wallet-transaction.service';
import { CustomerProfile } from 'src/modules/customerProfiles/entities/customer-profile.entity';
import { ReservationPaymentContext } from '../interfaces/reservation-payment.context';
import { CustomersService } from 'src/modules/customerProfiles/customers.service';
import { AdminConfig } from 'src/modules/admin/admin.config';
import { ReservationPricingService } from './reservation-pricing.service';
import { ArenaExtraWithQuantity } from 'src/modules/arenas/types/arena-extra-with-quantity.type';
import { ArenaExtrasService } from 'src/modules/arena-extras/arena-extras.service';

@Injectable()
export class ReservationPolicy {
  constructor(
    private readonly arenasService: ArenasService,
    private readonly walletTransactionService: WalletTransactionService,
    private readonly customersService: CustomersService,
    private readonly adminConfig: AdminConfig,
    private readonly reservationPricingService: ReservationPricingService,
    private readonly arenaExtrasService: ArenaExtrasService,
  ) {}

  // VALIDATION METHODS
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
    // validate it's not previous slot
    let CurrentHour = now.hour;
    if (
      slots.some((h) => Number(h) < CurrentHour) &&
      reservationDate.hasSame(now, 'day')
    ) {
      return ApiResponseUtil.throwError(
        'errors.reservation.past_time',
        'RESERVATION_SLOT_IN_PAST',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validateSlotsAreInAllowedRange(slots: number[], arena: Arena): void | never {
    if (slots.some((h) => h < arena.openingHour || h >= arena.closingHour)) {
      return ApiResponseUtil.throwError(
        'errors.reservation.invalid_slots',
        'INVALID_RESERVATION_SLOTS',
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

  ensureArenaIsActive(arena: Arena): void | never {
    if (arena.status !== ArenaStatus.ACTIVE) {
      return ApiResponseUtil.throwError(
        'errors.arena.not_active',
        'ARENA_NOT_ACTIVE',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  ensureOwner(arena: Arena, user: User): void | never {
    if (arena.owner.id !== user.id) {
      return ApiResponseUtil.throwError(
        'errors.arena.unauthorized_update',
        'UNAUTHORIZED_ACCESS',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // EXTRACTION METHODS
  async extractArenaAndExtras(
    dto: CreateReservationDto | CreateManualReservationDto,
    queryRunner: QueryRunner,
  ): Promise<{
    arena: Arena;
    extras: ArenaExtraWithQuantity[];
  }> {
    const arena = await this.arenasService.findOne(
      dto.arenaId,
      queryRunner.manager,
    );
    // Make sure arena is active
    this.ensureArenaIsActive(arena);

    // Load extras with quantity mapping
    if (!dto.extras || dto.extras.length === 0) {
      return { arena, extras: [] };
    }

    const extraIds = dto.extras.map((e) =>
      typeof e === 'string' ? e : e.extraId,
    );

    const arenaExtras = await this.arenaExtrasService.findArenaExtrasByIds(
      dto.arenaId,
      extraIds,
      queryRunner.manager,
    );

    // Map extras with their quantities
    const extrasWithQuantity = arenaExtras.map((extra) => {
      const extraItem = (dto.extras || []).find((e) =>
        typeof e === 'string' ? e === extra.id : e.extraId === extra.id,
      );
      const quantity =
        typeof extraItem === 'object' && extraItem ? extraItem.quantity : 1;
      return { ...extra, quantity };
    });

    return { arena, extras: extrasWithQuantity };
  }

  buildPaymentContext(reservation: Reservation): ReservationPaymentContext {
    const revenueAmounts = this.reservationPricingService.calculateRevenueSplit(
      reservation.totalAmount,
    );
    return {
      userId: reservation.customer.id,
      ownerId: reservation.arena.owner.id,
      adminId: this.adminConfig.adminId,
      referenceId: reservation.id,
      amounts: {
        player: revenueAmounts.playerAmount,
        owner: revenueAmounts.ownerAmount,
        admin: revenueAmounts.adminAmount,
      },
    };
  }

  async resolveCustomer(
    dto: CreateManualReservationDto,
  ): Promise<CustomerProfile> {
    if (dto.customerId) {
      return this.customersService.findOneById(dto.customerId);
    }
    return this.customersService.create(dto.customerDto);
  }
}
