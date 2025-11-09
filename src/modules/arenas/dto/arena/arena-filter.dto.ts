import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ArenaFilterDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  categoryId: string;
}
