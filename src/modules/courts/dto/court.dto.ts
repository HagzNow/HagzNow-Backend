import { Expose, Transform } from 'class-transformer';

export class CourtDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  status: string;

  @Expose()
  @Transform(({ obj }) => obj.arena?.id)
  arenaId: string;
}
