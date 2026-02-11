import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
  Validate,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    description: 'The ID of the arena to reserve',
    example: 'a3dcb37b-2b3c-4f3e-bef4-8b59bb35a5e3',
  })
  @IsUUID()
  arenaId: string;

  @ApiProperty({
    description: 'The date for which the reservation is made (YYYY-MM-DD)',
    example: '2025-11-10',
  })
  @IsDateString({ strict: true }, { message: 'errors.validation.invalid_date' })
  @IsNotEmpty({ message: 'errors.validation.required_field' })
  date: string;

  @ApiProperty({
    description:
      'List of hours the user wants to reserve (e.g. 9 = 9:00–10:00)',
    example: [9, 10],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'errors.validation.array_not_empty' })
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(23, { each: true })
  slots: number[];

  @ApiProperty({
    description:
      'Optional list of extra service IDs chosen for this reservation',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  extras?: string[];
}
