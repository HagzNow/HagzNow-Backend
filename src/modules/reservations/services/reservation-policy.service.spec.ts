import { ReservationPolicy } from './reservation-policy.service';

describe('ReservationPolicy', () => {
  it('builds wallet settlement context from the deposit total', () => {
    const calculateRevenueSplit = jest.fn().mockReturnValue({
      playerAmount: 70,
      ownerAmount: 63,
      adminAmount: 7,
    });
    const policy = new ReservationPolicy(
      {} as never,
      {} as never,
      { adminId: 'admin-id' } as never,
      { calculateRevenueSplit } as never,
      {} as never,
      {} as never,
    );

    const context = policy.buildPaymentContext({
      id: 'reservation-id',
      totalAmount: 240,
      depositTotalAmount: 70,
      customer: { id: 'customer-id' },
      arena: { owner: { id: 'owner-id' } },
    } as never);

    expect(calculateRevenueSplit).toHaveBeenCalledWith(70);
    expect(context.amounts.player).toBe(70);
  });
});
