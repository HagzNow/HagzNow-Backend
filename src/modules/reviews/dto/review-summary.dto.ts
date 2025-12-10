import { Expose, Transform } from 'class-transformer';

export class ReviewSummaryDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  rating: number;

  @Expose()
  createdAt: string;

  @Expose()
  @Transform(({ obj }) => obj.user.fName + ' ' + obj.user.lName)
  userName: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.avatar ?? null)
  userAvatar?: string | null;
}
