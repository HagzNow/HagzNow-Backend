import { Expose, Transform } from 'class-transformer';
import { ReservationStatus } from '../interfaces/reservation-status.interface';

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

  @Expose()
  status: ReservationStatus;
}
