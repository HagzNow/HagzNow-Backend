import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

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
  @Min(0)
  price: number;
}
