import { Expose, Transform } from 'class-transformer';
import { PayoutMethod } from 'src/modules/users/interfaces/payout-method.interface';
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

  @Expose()
  @Transform(({ obj }) => obj.user.fName + ' ' + obj.user.lName)
  userName: string;

  @Expose()
  @Transform(({ obj }) => obj.user.email)
  userEmail: string;

  @Expose()
  @Transform(({ obj }) => obj.user.phone)
  userPhone: string;

  @Expose()
  @Transform(({ obj }) => obj.user.payoutMethod)
  userPayoutMethod: PayoutMethod;
}
