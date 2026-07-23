import { Expose, Type } from 'class-transformer';
import { ReservationExtraDto } from 'src/modules/reservations/dto/reservation-extra.dto';
import { ReservationSummaryDto } from 'src/modules/reservations/dto/reservation-summary.dto';

export class ReservationTransactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ReservationSummaryDto)
  reservation: ReservationSummaryDto;

  @Expose()
  @Type(() => ReservationExtraDto)
  extras?: ReservationExtraDto[];

  @Expose()
  amount: number;

  @Expose()
  type: string;

  @Expose()
  method: string;

  @Expose()
  stage: string;

  @Expose()
  note?: string;

  @Expose()
  externalReferenceId?: string;

  @Expose()
  createdAt: Date;
}
