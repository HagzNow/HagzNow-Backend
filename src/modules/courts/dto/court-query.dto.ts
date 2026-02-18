import { IsEnum, IsOptional } from 'class-validator';
import { CourtStatus } from '../interfaces/court-status.interface';

export class CourtQueryDto {
  @IsOptional()
  @IsEnum(CourtStatus)
  status?: CourtStatus;
}
