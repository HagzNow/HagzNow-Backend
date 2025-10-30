// dto/update-arena-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ArenaStatus } from '../interfaces/arena-status.interface';

export class UpdateArenaStatusDto {
  @ApiProperty({ enum: [ArenaStatus.ACTIVE, ArenaStatus.DISABLE] })
  @IsEnum(ArenaStatus, { message: 'Status must be either active or disabled' })
  status: ArenaStatus;
}
