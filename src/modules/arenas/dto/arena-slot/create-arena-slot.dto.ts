import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateArenaSlotDto {
  @ApiProperty({
    description: 'Date of the slot (YYYY-MM-DD)',
    example: '2024-07-15',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Hour of the slot in 24-hour format ',
    example: '14',
  })
  @IsString()
  @IsNotEmpty()
  hour: string;

  @ApiProperty({
    description: 'reference to the Arena ID',
    example: '14',
  })
  @IsNotEmpty()
  @IsInt()
  arenaId: string;
}
