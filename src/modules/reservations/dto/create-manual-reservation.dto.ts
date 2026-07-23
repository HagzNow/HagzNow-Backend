import { CreateCustomerDto } from 'src/modules/customerProfiles/dto/create-customer.dto';
import { CreateReservationDto } from './create-reservation.dto';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateManualReservationDto extends CreateReservationDto {
  @IsOptional()
  @IsUUID()
  customerId: string;

  @ValidateIf((o) => !o.customerId)
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customerDto: CreateCustomerDto;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'errors.validation.invalid_amount' },
  )
  @IsPositive()
  @IsNotEmpty({ message: 'errors.validation.required_field' })
  paidAmount: number;
}
