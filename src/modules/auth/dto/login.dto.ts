import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'errors.validation.required_field' })
  email: string;

  @IsString()
  @Length(8, 20, { message: 'errors.auth.password_length' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/, {
    message: 'errors.auth.password_too_weak',
  })
  password: string;
}
