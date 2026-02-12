import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class UpdatePhoneDto {
  @IsNotEmpty({ message: 'errors.validation.phone_required' })
  @IsPhoneNumber('EG', { message: 'errors.auth.invalid_phone_number' })
  newPhone: string;
}
