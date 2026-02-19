import { Expose, Transform } from 'class-transformer';

export class ArenaExtraDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.extra?.name || obj.name)
  name: string;

  @Expose()
  @Transform(({ obj }) => {
    return obj.priceAtReservation || obj.extra?.price || obj.price;
  })
  price: number;

  @Expose()
  @Transform(({ obj }) => obj.cancelledAt === null)
  isActive: boolean;

  @Expose()
  quantity: number;
}
