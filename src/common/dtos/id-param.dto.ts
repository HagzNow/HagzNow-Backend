// src/common/dto/id-param.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class IdParamDto {
  @ApiProperty({ description: 'The unique identifier (UUID)' })
  @IsUUID(undefined, { message: 'Invalid ID format, must be a valid UUID' })
  id: string;
}
