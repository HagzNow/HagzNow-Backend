import { Expose, Transform } from 'class-transformer';

export class ReservationExtraDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.extra?.name)
  name: string;

  @Expose()
  @Transform(({ obj }) => Number(obj.priceAtReservation))
  price: number;

  @Expose()
  @Transform(
    ({ obj }) =>
      (Math.round(Number(obj.priceAtReservation) * 100) *
        Number(obj.quantity)) /
      100,
  )
  subtotal: number;

  @Expose()
  @Transform(({ obj }) => obj.cancelledAt === null)
  isActive: boolean;

  @Expose()
  quantity: number;
}
