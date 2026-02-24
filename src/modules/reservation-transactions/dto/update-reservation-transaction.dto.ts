import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';

export class UpdateReservationTransactionDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum([TransactionStage.PENDING, TransactionStage.INSTANT])
  stage?: TransactionStage;
}
