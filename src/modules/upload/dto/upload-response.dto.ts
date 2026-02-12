import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Relative path to the uploaded image',
    example: 'users/abc123.webp',
  })
  path: string;

  @Expose()
  @ApiProperty({
    description: 'Full public URL to access the image',
    example: 'https://hagznow.com/uploads/users/abc123.webp',
  })
  url: string;
}
