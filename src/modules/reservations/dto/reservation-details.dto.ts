import { Expose, Type } from 'class-transformer';
import { ArenaSummaryDto } from 'src/modules/arenas/dto/arena/arena-summary.dto';
import { CourtSlotDto } from 'src/modules/court-slots/dto/court-slot.dto';
import { CustomerResponseDto } from 'src/modules/customerProfiles/dto/customer-reponse.dto';
import { ReservationExtraDto } from './reservation-extra.dto';

export class ReservationDetailsDto {
  @Expose()
  id: string;

  @Expose()
  dateOfReservation: string;

  @Expose()
  @Type(() => ArenaSummaryDto)
  arena: ArenaSummaryDto;

  @Expose()
  paymentMethod: string;

  @Expose()
  status: string;

  @Expose()
  totalHours: number;

  @Expose()
  playTotalAmount: number;

  @Expose()
  extrasTotalAmount: number;

  @Expose()
  totalAmount: number;

  @Expose()
  @Type(() => CourtSlotDto)
  slots: CourtSlotDto[];

  @Expose()
  @Type(() => ReservationExtraDto)
  extras: ReservationExtraDto[];

  @Expose()
  @Type(() => CustomerResponseDto)
  customer: CustomerResponseDto;
}
