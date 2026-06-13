import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStage } from '../../../common/interfaces/transactions/transaction-stage.interface';
import { TransactionType } from '../../../common/interfaces/transactions/transaction-type.interface';

export class CreateWalletTransactionDto {
  @ApiProperty({
    description: 'The amount of the transaction',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  @Min(20, { message: 'errors.wallet_transaction.amount_too_low' })
  amount: number;

  @IsNotEmpty()
  @IsEnum(TransactionStage)
  stage: TransactionStage;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  referenceId?: string;
}
