import { IsNotEmpty, IsEmail } from 'class-validator';

export class UpdateEmailDto {
  @IsNotEmpty({ message: 'errors.validation.email_required' })
  @IsEmail({}, { message: 'errors.validation.invalid_email' })
  newEmail: string;
}
