import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';

export class UpdateReservationTransactionDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum([TransactionStage.PENDING, TransactionStage.INSTANT])
  stage?: TransactionStage;

  @IsOptional()
  @IsString()
  note?: string;
}
