import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CourtSlotQueryDto {
  @ApiProperty({
    description: 'Date to check available slots for (format: yyyy-mm-dd)',
    example: '2023-12-31',
  })
  @IsDateString({ strict: true })
  date: string; // yyyy-mm-dd
}
