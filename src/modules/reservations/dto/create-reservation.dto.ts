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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationExtraItemDto } from '../../reservation-extras/dto/reservation-extra-item.dto';
import { CourtReservationSlotsDto } from './court-reservation-slots.dto';
import { ArrayUniqueBy } from 'src/common/validators/array-unique-by.validator';

export class CreateReservationDto {
  @ApiProperty({
    description: 'The date for which the reservation is made (YYYY-MM-DD)',
    example: '2025-11-10',
  })
  @IsDateString({ strict: true }, { message: 'errors.validation.invalid_date' })
  @IsNotEmpty({ message: 'errors.validation.required_field' })
  date: string;

  @IsArray({ message: 'courtReservationSlotsDto must be an array' })
  @ArrayMinSize(1, { message: 'courtReservationSlotsDto cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => CourtReservationSlotsDto)
  slots: CourtReservationSlotsDto[];

  @ApiProperty({
    description:
      'Optional list of extra services with quantities for this reservation',
    type: [ReservationExtraItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
    message: 'errors.validation.invalid_extras_format',
  })
  @Type(() => ReservationExtraItemDto)
  extras?: ReservationExtraItemDto[];
}
