import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsArray,
  ArrayMinSize,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class CourtReservationSlotsDto {
  @ApiProperty({
    description: 'The ID of the court to reserve',
    example: 'a3dcb37b-2b3c-4f3e-bef4-8b59bb35a5e3',
  })
  @IsNotEmpty({ message: 'courtId is required' })
  @IsUUID('4', { message: 'errors.validation.invalid_uuid' })
  courtId: string;

  @ApiProperty({
    description:
      'List of hours the user wants to reserve (e.g. 9 = 9:00–10:00)',
    example: [9, 10],
    type: [Number],
  })
  @IsArray({ message: 'slots must be an array of numbers' })
  @ArrayMinSize(1, { message: 'slots cannot be empty' })
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(23, { each: true })
  slots: number[];
}
