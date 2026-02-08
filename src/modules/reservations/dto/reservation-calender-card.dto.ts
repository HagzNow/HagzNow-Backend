import { Expose, Transform } from 'class-transformer';
export class ReservationCalenderCardDto {
  @Expose()
  id: string;

  @Expose()
  dateOfReservation: Date;

  @Expose()
  totalAmount: number;

  @Expose()
  @Transform(({ obj }) => {
    const user = obj.customer;
    return user ? user.fName + ' ' + user.lName : 'N/A';
  })
  playerName: string;

  @Expose()
  @Transform(({ obj }) => obj.date)
  date: Date;

  @Expose()
  @Transform(({ obj }) => obj.slots.map((slot) => slot.hour))
  slots: string[];
}
