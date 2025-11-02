import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWalletTransactionDto } from './create-wallet-transaction.dto';

export class UpdateWalletTransactionDto extends PartialType(
  CreateWalletTransactionDto,
) {
  @ApiProperty({ description: 'Category name', example: 'Tennis' })
  name: string;
}
