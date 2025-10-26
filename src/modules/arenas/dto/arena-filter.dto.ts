import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ArenaFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;
}
