import { Expose, Transform } from 'class-transformer';
import { getUploadUrl } from 'src/common/utils/upload-url.util';

export class ArenaImageDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ value }) => getUploadUrl(value))
  path: string;
}
