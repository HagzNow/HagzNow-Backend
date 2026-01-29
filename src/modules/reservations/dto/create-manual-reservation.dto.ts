import { CreateCustomerDto } from 'src/modules/customerProfiles/dto/create-customer.dto';
import { CreateReservationDto } from './create-reservation.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class CreateManualReservationDto extends CreateReservationDto {
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customerDto: CreateCustomerDto;
}
