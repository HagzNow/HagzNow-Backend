import { Expose, Type } from 'class-transformer';
import { ArenaSummaryDto } from 'src/modules/arenas/dto/arena/arena-summary.dto';
import { CourtSlotDto } from 'src/modules/court-slots/dto/court-slot.dto';
import { CustomerResponseDto } from 'src/modules/customerProfiles/dto/customer-reponse.dto';
import { ReservationExtraDto } from './reservation-extra.dto';
import { ReservationPaymentStatus } from '../interfaces/reservation-payment-status.interface';
import { ReservationTransactionDetailsDto } from 'src/modules/reservation-transactions/dto/reservation-transaction-details.dto';

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
  playDepositRate: number;

  @Expose()
  extrasDepositRate: number;

  @Expose()
  playDepositAmount: number;

  @Expose()
  extrasDepositAmount: number;

  @Expose()
  depositTotalAmount: number;

  @Expose()
  paidAmount: number;

  @Expose()
  remainingAmount: number;

  @Expose()
  paymentStatus: ReservationPaymentStatus;

  @Expose()
  @Type(() => CourtSlotDto)
  slots: CourtSlotDto[];

  @Expose()
  @Type(() => ReservationExtraDto)
  extras: ReservationExtraDto[];

  @Expose()
  @Type(() => ReservationTransactionDetailsDto)
  transactions: ReservationTransactionDetailsDto[];

  @Expose()
  @Type(() => CustomerResponseDto)
  customer: CustomerResponseDto;
}
