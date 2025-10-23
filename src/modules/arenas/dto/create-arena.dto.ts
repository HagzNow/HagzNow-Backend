import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ArenaStatus } from '../interfaces/arena-status.interface';
import { CreateArenaImageDto } from './create-arena-image.dto';
import { CreateArenaLocationDto } from './create-arena-location.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArenaDto {
  @ApiProperty({
    description: 'Arena name',
    example: 'Downtown Football Arena',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Thumbnail image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @ApiProperty({
    description: 'Minimum booking period (in hours)',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  minPeriod: number;

  @ApiProperty({
    description: 'Opening hour (0–23)',
    example: 8,
    minimum: 0,
    maximum: 23,
  })
  @IsNumber()
  @Min(0)
  @Max(23)
  openingHour: number;

  @ApiProperty({
    description: 'Closing hour (0–23)',
    example: 22,
    minimum: 0,
    maximum: 23,
  })
  @IsNumber()
  @Min(0)
  @Max(23)
  closingHour: number;

  @ApiProperty({ description: 'Price per hour', example: 150, minimum: 0 })
  @IsNumber()
  @Min(0)
  pricePerHoue: number;

  @ApiProperty({
    description: 'Deposit amount as a percentage of total price',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  depositPercent: number;

  @ApiPropertyOptional({
    description: 'Arena description',
    example: 'Spacious field with night lighting',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Arena policy',
    example: 'No cancellations within 24 hours of booking.',
  })
  @IsOptional()
  @IsString()
  policy?: string;

  @ApiPropertyOptional({
    enum: ArenaStatus,
    description: 'Current status of the arena',
  })
  @IsOptional()
  @IsEnum(ArenaStatus)
  status?: ArenaStatus;

  @ApiPropertyOptional({ description: 'Category ID', example: 3 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    type: () => CreateArenaLocationDto,
    description: 'Arena location details',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateArenaLocationDto)
  location?: CreateArenaLocationDto;

  @ApiPropertyOptional({
    type: [CreateArenaImageDto],
    description: 'List of arena images',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArenaImageDto)
  images?: CreateArenaImageDto[];
}
