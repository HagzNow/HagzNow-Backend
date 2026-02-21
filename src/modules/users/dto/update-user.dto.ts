import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { PayoutMethod } from '../interfaces/payout-method.interface';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['phone', 'email', 'password'] as const),
) {
  @IsOptional()
  @IsEnum(PayoutMethod)
  payoutMethod?: PayoutMethod;
}
