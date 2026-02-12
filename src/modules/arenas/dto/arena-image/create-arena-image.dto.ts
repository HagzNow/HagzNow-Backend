import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateArenaImageDto {
  @ApiProperty({
    description: 'Relative path to the uploaded image (e.g., "arenas/abc123.webp")',
    example: 'arenas/abc123.webp',
  })
  @IsString()
  @IsNotEmpty()
  path: string;
}
