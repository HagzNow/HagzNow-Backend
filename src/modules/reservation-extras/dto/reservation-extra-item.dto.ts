import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

/**
 * DTO for a single extra item in a reservation
 * Includes both the extra ID and the quantity desired
 */
export class ReservationExtraItemDto {
  @ApiProperty({
    description: 'The ID of the arena extra',
    example: 'e3dcb37b-2b3c-4f3e-bef4-8b59bb35a5e4',
  })
  @IsUUID()
  @IsNotEmpty()
  extraId: string;

  @ApiProperty({
    description: 'The quantity of this extra item to add',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'errors.validation.quantity_minimum' })
  @Max(100, { message: 'errors.validation.quantity_maximum' })
  quantity: number;
}
