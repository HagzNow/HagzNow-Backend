import { OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreateArenaDto } from './create-arena.dto';
import { UpdateArenaExtraDto } from './update-arena-extra.dto';
import { UpdateArenaImageDto } from './update-arena-image.dto';
import { UpdateArenaLocationDto } from './update-arena-location.dto';

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
