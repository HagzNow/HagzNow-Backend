import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  fName: string;

  @IsString()
  @IsNotEmpty()
  lName: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('EG')
  phone: string;

  @IsOptional()
  @IsUUID()
  userId?: string; // optional link to User
}
