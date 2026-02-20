import { Expose, Transform } from 'class-transformer';
import { ArenaStatus } from '../../interfaces/arena-status.interface';
import { getUploadUrl } from 'src/common/utils/upload-url.util';

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
  @Transform(({ value }) => getUploadUrl(value))
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
  @Transform(({ obj }) => {
    if (!obj.reviews) {
      return 0;
    }
    return obj.reviews.length;
  })
  numOfReviews: number;

  @Expose()
  status: ArenaStatus;

  @Expose()
  @Transform(({ obj }) => {
    if (!obj.courts || obj.courts.length === 0) {
      return 0;
    }
    return obj.courts.length;
  })
  numOfCourts: number;
}
