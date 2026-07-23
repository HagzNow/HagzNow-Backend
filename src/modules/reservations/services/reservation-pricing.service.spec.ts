import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { ReservationPricingService } from './reservation-pricing.service';

describe('ReservationPricingService', () => {
  it('calculates full totals and immutable deposit components in cents', () => {
    const service = new ReservationPricingService(
      { adminFeeRate: 0.1 } as never,
      { extrasDepositRate: 0.5 } as never,
    );
    const arena = {
      pricePerHour: 100.25,
      depositPercent: 25,
    } as Arena;

    const amounts = service.calculateReservationAmounts(arena, [10, 11, 12], [
      { price: 10.15, quantity: 2 },
    ] as never);

    expect(amounts).toEqual({
      playTotalAmount: 300.75,
      extrasTotalAmount: 20.3,
      totalAmount: 321.05,
      playDepositRate: 0.25,
      extrasDepositRate: 0.5,
      playDepositAmount: 75.19,
      extrasDepositAmount: 10.15,
      depositTotalAmount: 85.34,
    });
  });

  it('keeps revenue splits cents-safe', () => {
    const service = new ReservationPricingService(
      { adminFeeRate: 0.1 } as never,
      { extrasDepositRate: 1 } as never,
    );

    expect(service.calculateRevenueSplit(85.34)).toEqual({
      playerAmount: 85.34,
      ownerAmount: 76.81,
      adminAmount: 8.53,
    });
  });
});
