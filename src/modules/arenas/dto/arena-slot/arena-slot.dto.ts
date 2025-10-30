import { Expose } from 'class-transformer';

export class ArenaSlotDto {
  @Expose()
  id: string;

  @Expose()
  date: string;

  @Expose()
  hour: number;

  @Expose()
  arenaId?: string;

  @Expose()
  reservationId?: string;
}
