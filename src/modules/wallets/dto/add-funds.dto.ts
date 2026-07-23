import { IsDecimal, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class AddFundsDto {
  @IsDecimal(
    { decimal_digits: '0,2' },
    { message: 'errors.validation.invalid_amount' },
  )
  @IsPositive()
  @IsNotEmpty({ message: 'errors.validation.required_field' })
  amount: number;
}
