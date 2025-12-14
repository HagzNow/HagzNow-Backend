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
  depositPercent: number;

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
  @Transform(({ obj }) => {
    if (!obj.reviews || obj.reviews.length === 0) {
      return 0;
    }
    const totalRating = obj.reviews.reduce(
      (acc, review) => acc + Number(review.rating),
      0,
    );
    return parseFloat((totalRating / obj.reviews.length).toFixed(2));
  })
  averageRating: number;

  @Expose()
  status: ArenaStatus;
}
