import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class ArenaFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsString()
  governorate: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'direction must be either ASC or DESC',
  })
  direction: 'ASC' | 'DESC' = 'ASC';
}
