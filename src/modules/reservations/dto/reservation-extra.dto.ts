import { Expose, Transform } from 'class-transformer';

export class ReservationExtraDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.extra?.name)
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.priceAtReservation)
  price: number;

  @Expose()
  @Transform(({ obj }) => obj.cancelledAt === null)
  isActive: boolean;

  @Expose()
  quantity: number;
}
