import { Expose, Transform } from 'class-transformer';

export class ArenaSummaryDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.category.name)
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
}
