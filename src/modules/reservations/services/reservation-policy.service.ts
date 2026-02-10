import { HttpStatus, Injectable } from '@nestjs/common';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { DateTime } from 'luxon';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { ArenaExtra } from 'src/modules/arenas/entities/arena-extra.entity';
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

@Injectable()
export class ReservationPolicy {
  constructor(
    private readonly arenasService: ArenasService,
    private readonly walletTransactionService: WalletTransactionService,
    private readonly customersService: CustomersService,
    private readonly adminConfig: AdminConfig,
  ) {}

  // VALIDATION METHODS
  validateDateAndSlots(date: string, slots: number[]) {
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

  validateExistingUser(reservation: Reservation) {
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
  ) {
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
  ) {
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

  ensureArenaIsActive(arena: Arena) {
    if (arena.status !== ArenaStatus.ACTIVE) {
      return ApiResponseUtil.throwError(
        'errors.arena.not_active',
        'ARENA_NOT_ACTIVE',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  ensureOwner(arena: Arena, user: User) {
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
    extras: ArenaExtra[];
  }> {
    const arena = await this.arenasService.findOne(
      dto.arenaId,
      queryRunner.manager,
    );
    // Make sure arena is active
    this.ensureArenaIsActive(arena);
    // Load extras
    const extras = await this.arenasService.findArenaExtrasByIds(
      dto.arenaId,
      dto.extras || [],
      queryRunner.manager,
    );
    return { arena, extras };
  }

  buildPaymentContext(
    reservation: Reservation,
    user: User,
  ): ReservationPaymentContext {
    return {
      userId: user.id,
      ownerId: reservation.arena.owner.id,
      adminId: this.adminConfig.adminId,
      referenceId: reservation.id,
      amounts: {
        player: reservation.totalAmount,
        owner: reservation.arena.ownerAmount(
          reservation.slots.length,
          reservation.extras,
        ),
        admin: reservation.arena.adminAmount(
          reservation.slots.length,
          reservation.extras,
        ),
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
