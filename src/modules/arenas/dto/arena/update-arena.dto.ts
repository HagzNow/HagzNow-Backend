import { OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { UpdateArenaExtraDto } from '../arena-extra/update-arena-extra.dto';
import { UpdateArenaImageDto } from '../arena-image/update-arena-image.dto';
import { UpdateArenaLocationDto } from '../arena-location/update-arena-location.dto';
import { CreateArenaDto } from './create-arena.dto';

export class UpdateArenaDto extends PartialType(
  OmitType(CreateArenaDto, ['location', 'images', 'extras'] as const),
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateArenaExtraDto)
  extras?: UpdateArenaExtraDto[];
}
