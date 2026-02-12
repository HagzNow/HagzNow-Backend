import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateArenaExtraDto {
  @ApiProperty({
    description: 'Extra service name',
    example: 'ball',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Price of the extra service',
    example: 50,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive({ message: 'errors.validation.price_must_be_positive' })
  @IsNotEmpty({ message: 'errors.validation.required_field' })
  price: number;
}
