import {
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { UserRole } from '../interfaces/userRole.interface';
import { PayoutMethod } from '../interfaces/payout-method.interface';

export class CreateUserDto {
  @IsString()
  fName: string;

  @IsString()
  lName: string;

  @IsEmail()
  email: string;

  @Length(11, 12, {
    message: 'Phone number must be valid',
  })
  @IsString()
  phone: string;

  @IsString()
  @Length(8, 20, { message: 'errors.auth.password_length' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/, {
    message: 'errors.auth.password_too_weak',
  })
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
