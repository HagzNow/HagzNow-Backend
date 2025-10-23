import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateArenaImageDto {
  @ApiProperty({
    description: 'Image file path or URL',
    example: 'https://example.com/arena1.jpg',
  })
  @IsString()
  @IsNotEmpty()
  path: string;
}
