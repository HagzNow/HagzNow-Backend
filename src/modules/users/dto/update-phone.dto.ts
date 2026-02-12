import { IsPhoneNumber } from 'class-validator';

export class UpdatePhoneDto {
  @IsPhoneNumber('EG', { message: 'errors.auth.invalid_phone_number' })
  phone: string;
}
