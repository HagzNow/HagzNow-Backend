import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ArenaStatus } from '../../interfaces/arena-status.interface';
import { CreateArenaExtraDto } from '../arena-extra/create-arena-extra.dto';
import { CreateArenaImageDto } from '../arena-image/create-arena-image.dto';
import { CreateArenaLocationDto } from '../arena-location/create-arena-location.dto';

export class CreateArenaDto {
  @ApiProperty({
    description: 'Arena name',
    example: 'Downtown Football Arena',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Thumbnail image path (relative path from upload)',
    example: 'arenas/abc123.webp',
  })
  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  // @ApiProperty({
  //   description: 'Minimum booking period (in hours)',
  //   example: 2,
  //   minimum: 1,
  // })
  // @IsNumber()
  // @Min(1)
  // minPeriod: number;
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
  pricePerHour: number;

  @ApiProperty({
    description: 'Deposit amount as a percentage of total price',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(20)
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
  @ApiPropertyOptional({ description: 'Category ID', example: 3 })
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    type: () => CreateArenaLocationDto,
    description: 'Arena location details',
  })
  @ValidateNested()
  @Type(() => CreateArenaLocationDto)
  location: CreateArenaLocationDto;

  @ApiProperty({
    description: 'Additional images for the arena (array of image paths)',
    type: [CreateArenaImageDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArenaImageDto)
  images?: CreateArenaImageDto[];

  @ApiPropertyOptional({
    type: [CreateArenaExtraDto],
    description: 'List of arena extras',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArenaExtraDto)
  extras?: CreateArenaExtraDto[];
}
