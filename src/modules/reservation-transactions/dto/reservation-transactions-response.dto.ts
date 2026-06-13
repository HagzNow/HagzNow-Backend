import { Expose, Type } from 'class-transformer';
import { ReservationSummaryDto } from 'src/modules/reservations/dto/reservation-summary.dto';

export class ReservationTransactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ReservationSummaryDto)
  reservation: ReservationSummaryDto;

  @Expose()
  amount: number;

  @Expose()
  type: string;

  @Expose()
  method: string;

  @Expose()
  status: string;

  @Expose()
  note?: string;

  @Expose()
  externalReferenceId?: string;

  @Expose()
  createdAt: Date;
}
