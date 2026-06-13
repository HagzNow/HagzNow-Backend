import { Expose, Transform } from 'class-transformer';

export class ArenaExtraDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  @Transform(({ obj }) => obj.cancelledAt === null)
  isActive: boolean;

  @Expose()
  quantity: number;
}
