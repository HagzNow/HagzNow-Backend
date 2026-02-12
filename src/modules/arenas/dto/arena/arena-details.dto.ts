import { Expose, Transform, Type } from 'class-transformer';
import { CategoryDto } from 'src/modules/categories/dto/category.dto';
import { UserDto } from 'src/modules/users/dto/user.dto';
import { ArenaStatus } from '../../interfaces/arena-status.interface';
import { ArenaExtraDto } from '../arena-extra/arena-extra.dto';
import { ArenaImageDto } from '../arena-image/arena-image.dto';
import { ArenaLocationDto } from '../arena-location/arena-location.dto';
import { getUploadUrl } from 'src/common/utils/upload-url.util';

export class ArenaDetailsDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ value }) => getUploadUrl(value))
  thumbnail: string;

  @Expose()
  minPeriod: number;

  @Expose()
  openingHour: number;

  @Expose()
  closingHour: number;

  @Expose()
  pricePerHour: number;

  @Expose()
  depositPercent: number;

  @Expose()
  description: string;

  @Expose()
  policy: string;

  @Expose()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @Expose()
  @Type(() => ArenaLocationDto)
  location?: ArenaLocationDto;

  @Type(() => ArenaImageDto)
  @Expose()
  images?: ArenaImageDto[];

  @Type(() => ArenaExtraDto)
  @Expose()
  extras?: ArenaExtraDto[];

  @Expose()
  status: ArenaStatus;

  @Expose()
  @Type(() => UserDto)
  owner: UserDto;
}
