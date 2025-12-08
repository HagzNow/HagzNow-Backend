import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ReservationFilterDto {
  @IsOptional()
  @IsString()
  arenaName: string;

  @IsOptional()
  @IsUUID()
  arenaCategoryId: string;
}
