// src/common/dto/id-param.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class IdParamDto {
  @ApiProperty({ description: 'The unique identifier (UUID)' })
  @IsUUID('4', { message: 'Invalid ID format, must be a UUID v4' })
  id: string;
}
