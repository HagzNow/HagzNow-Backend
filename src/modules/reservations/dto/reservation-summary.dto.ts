import { Expose, Transform } from 'class-transformer';

export class ReservationSummaryDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.arena.thumbnail)
  arenaThumbnail: string;

  @Expose()
  @Transform(({ obj }) => obj.arena.name)
  arenaName: string;

  @Expose()
  dateOfReservation: string;

  @Expose()
  @Transform(({ obj }) => obj.slots.map((slot) => slot.hour))
  slots: string[];

  @Expose()
  totalAmount: number;
}
