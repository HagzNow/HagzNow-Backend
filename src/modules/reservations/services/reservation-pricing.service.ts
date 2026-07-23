import { Injectable } from '@nestjs/common';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { ReservationExtra } from '../entities/reservation-extra.entity';
import { AdminConfig } from 'src/modules/admin/admin.config';
import { ArenaExtraWithQuantity } from 'src/modules/arenas/types/arena-extra-with-quantity.type';
import { ReservationAmounts } from '../interfaces/reservation-amounts.interface';
import { ReservationConfig } from '../reservation.config';

@Injectable()
export class ReservationPricingService {
  constructor(
    private readonly adminConfig: AdminConfig,
    private readonly reservationConfig: ReservationConfig,
  ) {}

  normalizeExtras(extras?: any[]): any[] {
    return extras ?? [];
  }

  calculatePlayAmount(arena: Arena, hours: number): number {
    return this.toCents(Number(arena.pricePerHour) * Number(hours)) / 100;
  }

  calculateExtrasAmount(
    extras?: ArenaExtraWithQuantity[] | ReservationExtra[],
  ): number {
    const extrasAmountInCents = this.normalizeExtras(extras)
      .filter((e) => !e.cancelledAt)
      .reduce(
        (sum, extra) =>
          sum + this.toCents(Number(extra.price) * Number(extra.quantity)),
        0,
      );

    return extrasAmountInCents / 100;
  }

  calculateDepositAmount(arena: Arena, hours: number) {
    return this.applyRate(
      this.calculatePlayAmount(arena, hours),
      this.getPlayDepositRate(arena),
    );
  }

  calculateDepositTotalAmount(
    arena: Arena,
    hours: number,
    extras?: ArenaExtraWithQuantity[] | ReservationExtra[],
  ): number {
    return this.addAmounts(
      this.calculateDepositAmount(arena, Number(hours)),
      this.applyRate(
        this.calculateExtrasAmount(extras),
        this.reservationConfig.extrasDepositRate,
      ),
    );
  }

  calculateBonusTransactionAmount(
    amount: number | undefined,
    extras?: Array<{ extraId: string; quantity: number }>,
    arenaExtras?: ArenaExtraWithQuantity[],
  ): number {
    if (!extras?.length) {
      if (amount === undefined || amount === null) {
        ApiResponseUtil.throwError(
          'errors.transaction.invalid_amount',
          'INVALID_AMOUNT',
          400,
        );
      }

      return Number(amount);
    }

    return this.calculateExtrasAmount(arenaExtras);
  }

  calculateReservationAmounts(
    arena: Arena,
    slots: number[],
    extras: ArenaExtraWithQuantity[],
  ): ReservationAmounts {
    const playTotalAmount = this.calculatePlayAmount(arena, slots.length);
    const extrasTotalAmount = this.calculateExtrasAmount(extras);
    const totalAmount = this.addAmounts(playTotalAmount, extrasTotalAmount);
    const playDepositRate = this.getPlayDepositRate(arena);
    const extrasDepositRate = this.reservationConfig.extrasDepositRate;
    const playDepositAmount = this.applyRate(playTotalAmount, playDepositRate);
    const extrasDepositAmount = this.applyRate(
      extrasTotalAmount,
      extrasDepositRate,
    );
    const depositTotalAmount = this.addAmounts(
      playDepositAmount,
      extrasDepositAmount,
    );

    return {
      playTotalAmount,
      extrasTotalAmount,
      totalAmount,
      playDepositRate,
      extrasDepositRate,
      playDepositAmount,
      extrasDepositAmount,
      depositTotalAmount,
    };
  }
  calculateRevenueSplit(totalAmount: number): {
    playerAmount: number;
    ownerAmount: number;
    adminAmount: number;
  } {
    totalAmount = Number(totalAmount);
    const adminFeeRate = Number(this.adminConfig.adminFeeRate) ?? 0;
    const playerAmount = this.toCents(totalAmount) / 100;
    const adminAmount = this.applyRate(playerAmount, adminFeeRate);
    const ownerAmount = this.addAmounts(playerAmount, -adminAmount);
    return { playerAmount, ownerAmount, adminAmount };
  }

  private getPlayDepositRate(arena: Arena): number {
    return Number(arena.depositPercent) / 100;
  }

  private applyRate(amount: number, rate: number): number {
    return Math.round(this.toCents(amount) * Number(rate)) / 100;
  }

  private addAmounts(...amounts: number[]): number {
    return (
      amounts.reduce((total, amount) => total + this.toCents(amount), 0) / 100
    );
  }

  private toCents(amount: number): number {
    return Math.round(Number(amount) * 100);
  }
}
