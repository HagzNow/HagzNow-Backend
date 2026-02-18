import { Expose, Transform } from 'class-transformer';

export class CourtSlotDto {
  @Expose()
  id: string;

  @Expose()
  date: string;

  @Expose()
  hour: number;

  @Expose()
  @Transform(({ obj }) => obj.court?.id)
  courtId?: string;

  @Expose()
  @Transform(({ obj }) => {
    return obj.court?.name;
  })
  courtName?: string;
}
