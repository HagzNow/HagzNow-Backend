import { Expose } from 'class-transformer';
import { TransactionStage } from '../interfaces/transaction-stage.interface';
import { TransactionType } from '../interfaces/transaction-type.interface';

export class WalletTransactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  amount: number;

  @Expose()
  stage: TransactionStage;

  @Expose()
  type: TransactionType;

  @Expose()
  referenceId: string;
}
