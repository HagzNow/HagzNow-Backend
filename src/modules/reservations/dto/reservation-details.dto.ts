import { Expose, Transform, Type } from 'class-transformer';
import { ArenaExtraDto } from 'src/modules/arenas/dto/arena-extra/arena-extra.dto';
import { ArenaSlotDto } from 'src/modules/arenas/dto/arena-slot/arena-slot.dto';
import { ArenaSummaryDto } from 'src/modules/arenas/dto/arena/arena-summary.dto';

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
  @Type(() => ArenaSlotDto)
  slots: ArenaSlotDto[];

  @Expose()
  @Type(() => ArenaExtraDto)
  extras: ArenaExtraDto[];

  @Expose()
  @Transform(({ obj }) => obj.customer?.id ?? 'N/A')
  userId: string;
}
