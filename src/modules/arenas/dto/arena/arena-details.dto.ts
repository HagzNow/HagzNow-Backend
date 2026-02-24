import { Expose, Transform, Type } from 'class-transformer';
import { CategoryDto } from 'src/modules/categories/dto/category.dto';
import { UserDto } from 'src/modules/users/dto/user.dto';
import { ArenaExtraDto } from '../../../arena-extras/dto/arena-extra.dto';
import { ArenaImageDto } from '../arena-image/arena-image.dto';
import { ArenaLocationDto } from '../arena-location/arena-location.dto';
import { ArenaSummaryDto } from './arena-summary.dto';
import { CourtDto } from 'src/modules/courts/dto/court.dto';

export class ArenaDetailsDto extends ArenaSummaryDto {
  @Expose()
  minPeriod: number;

  @Expose()
  openingHour: number;

  @Expose()
  closingHour: number;

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
  @Type(() => UserDto)
  owner: UserDto;

  @Expose()
  @Type(() => CourtDto)
  courts: CourtDto[];
}
