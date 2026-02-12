import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Tennis',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'errors.validation.required_field' })
  @MinLength(2, { message: 'errors.validation.name_too_short' })
  @MaxLength(50, { message: 'errors.validation.name_too_long' })
  name: string;
}
