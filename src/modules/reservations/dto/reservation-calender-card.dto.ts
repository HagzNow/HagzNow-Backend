import { Expose, Transform } from 'class-transformer';
export class ReservationCalenderCardDto {
  @Expose()
  id: string;

  @Expose()
  dateOfReservation: Date;

  @Expose()
  totalAmount: number;

  @Expose()
  @Transform(({ obj }) => obj.user.fName + ' ' + obj.user.lName)
  playerName: string;

  @Expose()
  @Transform(({ obj }) => obj.date)
  date: Date;

  @Expose()
  @Transform(({ obj }) => obj.slots.map((slot) => slot.hour))
  slots: string[];
}
