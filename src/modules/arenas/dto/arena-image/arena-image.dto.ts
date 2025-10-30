import { Expose } from 'class-transformer';

export class ArenaImageDto {
  @Expose()
  id: string;

  @Expose()
  path: string;
}
