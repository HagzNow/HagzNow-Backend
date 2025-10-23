import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateArenaDto } from './create-arena.dto';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested, IsArray } from 'class-validator';
import { UpdateArenaImageDto } from './update-arena-image.dto';
import { UpdateArenaLocationDto } from './update-arena-location.dto';

export class UpdateArenaDto extends PartialType(
  OmitType(CreateArenaDto, ['location', 'images'] as const),
) {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateArenaLocationDto)
  location?: UpdateArenaLocationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateArenaImageDto)
  images?: UpdateArenaImageDto[];
}
