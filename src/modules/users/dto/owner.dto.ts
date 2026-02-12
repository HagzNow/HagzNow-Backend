import { Expose, Transform } from 'class-transformer';
import { UserDto } from './user.dto';
import { getUploadUrl } from 'src/common/utils/upload-url.util';

export class OwnerDto extends UserDto {
  @Expose()
  @Transform(({ value }) => getUploadUrl(value))
  nationalIdFront: string;
  @Expose()
  @Transform(({ value }) => getUploadUrl(value))
  nationalIdBack: string;
  @Expose()
  @Transform(({ value }) => getUploadUrl(value))
  selfieWithId: string;
}
