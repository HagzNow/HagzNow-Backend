import { Injectable } from '@nestjs/common';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { EntityManager } from 'typeorm';
import { CreateManualReservationDto } from '../dto/create-manual-reservation.dto';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ArenasService } from '../../arenas/arenas.service';
import { Reservation } from '../entities/reservation.entity';
import { CustomerProfile } from 'src/modules/customerProfiles/entities/customer-profile.entity';
import { ReservationPaymentContext } from '../interfaces/reservation-payment.context';
import { CustomersService } from 'src/modules/customerProfiles/customers.service';
import { AdminConfig } from 'src/modules/admin/admin.config';
import { ReservationPricingService } from './reservation-pricing.service';
import { ArenaExtraWithQuantity } from 'src/modules/arenas/types/arena-extra-with-quantity.type';
import { ArenaExtrasService } from 'src/modules/arena-extras/arena-extras.service';
import { Court } from 'src/modules/courts/entities/court.entity';
import { CourtsService } from 'src/modules/courts/courts.service';

@Injectable()
export class ReservationPolicy {
  constructor(
    private readonly arenasService: ArenasService,
    private readonly customersService: CustomersService,
    private readonly adminConfig: AdminConfig,
    private readonly reservationPricingService: ReservationPricingService,
    private readonly arenaExtrasService: ArenaExtrasService,
    private readonly courtsService: CourtsService,
  ) {}

  async extractCourtsAndArenaAndExtras(
    dto: CreateReservationDto | CreateManualReservationDto,
    entityManager: EntityManager,
  ): Promise<{
    courts: Court[];
    arena: Arena;
    extras: ArenaExtraWithQuantity[];
  }> {
    const courts = await this.courtsService.findManyByIds(
      dto.slots.map(({ courtId }) => courtId),
      entityManager,
    );

    const arena = await this.arenasService.findOne(
      courts[0].arena.id,
      entityManager,
    );
    this.arenasService.ensureArenaIsActive(arena);
    this.courtsService.validateAllCourtsAreActive(courts);
    this.courtsService.validateAllCourtsBelongToSameArena(courts, arena);

    if (!dto.extras || dto.extras.length === 0) {
      return { courts, arena, extras: [] };
    }

    const extraIds = dto.extras.map((extra) =>
      typeof extra === 'string' ? extra : extra.extraId,
    );
    const arenaExtras = await this.arenaExtrasService.findArenaExtrasByIds(
      arena.id,
      extraIds,
      entityManager,
    );
    const extrasWithQuantity = arenaExtras.map((extra) => {
      const extraItem = dto.extras?.find((item) =>
        typeof item === 'string'
          ? item === extra.id
          : item.extraId === extra.id,
      );
      const quantity =
        typeof extraItem === 'object' && extraItem ? extraItem.quantity : 1;
      return { ...extra, quantity };
    });

    return { courts, arena, extras: extrasWithQuantity };
  }

  buildPaymentContext(reservation: Reservation): ReservationPaymentContext {
    const revenueAmounts = this.reservationPricingService.calculateRevenueSplit(
      reservation.depositTotalAmount,
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
    return this.customersService.create(dto.customerId, dto.customerDto);
  }
}
