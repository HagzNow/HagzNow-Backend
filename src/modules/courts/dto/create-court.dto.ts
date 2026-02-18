import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCourtDto {
  @IsNotEmpty({ message: 'errors.validation.required_field' })
  @IsString()
  @MaxLength(100, { message: 'errors.validation.max_length_exceeded' })
  name: string;
}
