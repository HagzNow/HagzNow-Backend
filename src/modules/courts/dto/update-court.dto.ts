import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CourtStatus } from '../interfaces/court-status.interface';

export class UpdateCourtDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsEnum(CourtStatus)
  status?: CourtStatus;
}
