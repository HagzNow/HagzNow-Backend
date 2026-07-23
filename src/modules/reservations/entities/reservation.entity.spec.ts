import { Reservation } from './reservation.entity';
import { ReservationPaymentStatus } from '../interfaces/reservation-payment-status.interface';

describe('Reservation payment status', () => {
  it.each([
    [0, ReservationPaymentStatus.UNPAID, 100],
    [40, ReservationPaymentStatus.PARTIALLY_PAID, 60],
    [100, ReservationPaymentStatus.PAID, 0],
    [120, ReservationPaymentStatus.PAID, 0],
  ])(
    'derives status and remaining amount for paid amount %s',
    (paidAmount, paymentStatus, remainingAmount) => {
      const reservation = Object.assign(new Reservation(), {
        totalAmount: 100,
        paidAmount,
      });

      expect(reservation.paymentStatus).toBe(paymentStatus);
      expect(reservation.remainingAmount).toBe(remainingAmount);
    },
  );

  it('treats a collected booking deposit as partial payment of the full bill', () => {
    const reservation = Object.assign(new Reservation(), {
      totalAmount: 321.05,
      depositTotalAmount: 85.34,
      paidAmount: 85.34,
    });

    expect(reservation.paymentStatus).toBe(
      ReservationPaymentStatus.PARTIALLY_PAID,
    );
    expect(reservation.remainingAmount).toBe(235.71);
  });
});
