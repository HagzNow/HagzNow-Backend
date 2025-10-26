import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SortDto {
  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'direction must be either ASC or DESC',
  })
  direction: 'ASC' | 'DESC' = 'ASC';
}
