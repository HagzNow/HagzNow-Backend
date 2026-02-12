import {
  IsEmail,
  IsPhoneNumber,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

function capitalize(value: string): string {
  const trimmed = value.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export class CreateUserDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? capitalize(value) : value,
  )
  fName: string;

  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? capitalize(value) : value,
  )
  lName: string;

  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @IsPhoneNumber('EG', { message: 'errors.auth.invalid_phone_number' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone: string;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(8, 20, { message: 'errors.auth.password_length' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/, {
    message: 'errors.auth.password_too_weak',
  })
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
