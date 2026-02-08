import { CreateCustomerDto } from 'src/modules/customerProfiles/dto/create-customer.dto';
import { CreateReservationDto } from './create-reservation.dto';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsOptional,
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
}
