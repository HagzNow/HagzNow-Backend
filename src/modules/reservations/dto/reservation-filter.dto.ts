import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ReservationStatus } from '../interfaces/reservation-status.interface';

export class ReservationFilterDto {
  @IsOptional()
  @IsString()
  arenaName: string;

  @IsOptional()
  @IsUUID()
  arenaCategoryId: string;

  @IsOptional()
  @IsString()
  status: ReservationStatus;
}
