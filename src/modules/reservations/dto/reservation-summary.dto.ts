import { Expose, Transform } from 'class-transformer';
import { ReservationStatus } from '../interfaces/reservation-status.interface';
import { ReservationPaymentStatus } from '../interfaces/reservation-payment-status.interface';

export class ReservationSummaryDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.arena?.thumbnail)
  arenaThumbnail: string;

  @Expose()
  @Transform(({ obj }) => obj.arena?.name)
  arenaName: string;

  @Expose()
  @Transform(({ obj }) => obj.arena?.category?.name)
  arenaCategory: string;

  @Expose()
  dateOfReservation: string;

  @Expose()
  @Transform(({ obj }) => obj.slots?.map((slot) => slot.hour))
  slots: string[];

  @Expose()
  totalAmount: number;

  @Expose()
  depositTotalAmount: number;

  @Expose()
  paidAmount: number;

  @Expose()
  remainingAmount: number;

  @Expose()
  paymentStatus: ReservationPaymentStatus;

  @Expose()
  status: ReservationStatus;
}
