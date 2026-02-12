import { Injectable } from '@nestjs/common';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { ReservationExtra } from '../entities/reservation-extra.entity';
import { AdminConfig } from 'src/modules/admin/admin.config';
import { ArenaExtra } from 'src/modules/arenas/entities/arena-extra.entity';
import { ArenaExtraWithQuantity } from 'src/modules/arenas/types/arena-extra-with-quantity.type';

@Injectable()
export class ReservationPricingService {
  constructor(private readonly adminConfig: AdminConfig) {}
  normalizeExtras(extras?: any[]): any[] {
    return extras ?? [];
  }

  calculatePlayAmount(arena: Arena, hours: number): number {
    return Number(arena.pricePerHour) * hours;
  }

  calculateExtrasAmount(
    extras?: ArenaExtraWithQuantity[] | ReservationExtra[],
  ): number {
    console.log('Calculating extras amount for:', extras);
    return this.normalizeExtras(extras)
      .filter((e) => !e.cancelledAt)
      .reduce((sum, e) => sum + Number(e.price) * Number(e.quantity), 0);
  }

  calculateDepositAmount(arena: Arena, hours: number) {
    return (
      (this.calculatePlayAmount(arena, hours) * arena.depositPercent) / 100
    );
  }
  calculateDepositTotalAmount(
    arena: Arena,
    hours: number,
    extras?: ArenaExtraWithQuantity[] | ReservationExtra[],
  ): number {
    return (
      this.calculateDepositAmount(arena, Number(hours)) +
      this.calculateExtrasAmount(extras)
    );
  }

  calculateReservationAmounts(
    arena: Arena,
    slots: number[],
    extras: ArenaExtraWithQuantity[],
  ): { playAmount: number; extrasAmount: number; totalAmount: number } {
    const playAmount = this.calculateDepositAmount(arena, slots.length);
    const extrasAmount = this.calculateExtrasAmount(extras);
    const totalAmount = playAmount + extrasAmount;
    return { playAmount, extrasAmount, totalAmount };
  }
  calculateRevenueSplit(totalAmount: number): {
    playerAmount: number;
    ownerAmount: number;
    adminAmount: number;
  } {
    totalAmount = Number(totalAmount);
    const adminFeeRate = Number(this.adminConfig.adminFeeRate) ?? 0;
    const adminAmount = totalAmount * adminFeeRate;
    const ownerAmount = totalAmount - adminAmount;
    const playerAmount = totalAmount;
    return { playerAmount, ownerAmount, adminAmount };
  }
}
