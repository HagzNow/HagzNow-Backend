import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ReservationStatus } from '../interfaces/reservation-status.interface';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class ReservationFilterDto extends PaginationDto {
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
