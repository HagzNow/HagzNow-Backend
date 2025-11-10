import { Expose, Transform } from 'class-transformer';
import { ArenaStatus } from '../../interfaces/arena-status.interface';

export class ArenaSummaryDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  pricePerHour: number;

  @Expose()
  @Transform(({ obj }) => obj.category?.name ?? 'Uncategorized')
  categoryName: string;

  @Expose()
  thumbnail: string;

  @Expose()
  @Transform(({ obj }) => {
    const city = obj.location?.city || '';
    const governorate = obj.location?.governorate || '';
    return [city, governorate].filter(Boolean).join(', ');
  })
  locationSummary: string;

  @Expose()
  status: ArenaStatus;
}
