import {
  IsEmail,
  IsEnum,
  IsIn,
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
  @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  avatar?: string;
}
