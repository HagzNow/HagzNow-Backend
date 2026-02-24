import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';

export class CreateReservationTransactionDto {
  @IsNotEmpty()
  @IsUUID()
  reservationId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsIn([TransactionStage.PENDING, TransactionStage.INSTANT])
  stage: TransactionStage;

  @IsOptional()
  @IsString()
  note?: string;
}
