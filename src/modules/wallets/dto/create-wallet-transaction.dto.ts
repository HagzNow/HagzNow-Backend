import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStage } from '../interfaces/transaction-stage.interface';
import { TransactionType } from '../interfaces/transaction-type.interface';

export class CreateWalletTransactionDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Tennis',
  })
  @IsNumber()
  amount: number;

  @IsEnum(TransactionStage)
  stage: TransactionStage;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  referenceId?: string;
}
