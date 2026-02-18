import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateArenaLocationDto {
  @ApiProperty({ description: 'Latitude coordinate', example: 30.0444 })
  @IsNumber({}, { message: 'lat must be a number' })
  lat: number;

  @ApiProperty({ description: 'Longitude coordinate', example: 31.2357 })
  @IsNumber({}, { message: 'lng must be a number' })
  lng: number;

  @ApiProperty({ description: 'Governorate or region name', example: 'Cairo' })
  @IsString()
  @IsNotEmpty()
  governorate: string;

  @ApiPropertyOptional({ description: 'City name', example: 'Nasr City' })
  @IsOptional()
  @IsString()
  city?: string;
}
