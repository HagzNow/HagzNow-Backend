import { Expose } from 'class-transformer';

export class ArenaExtraDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  isActive: boolean;
}
