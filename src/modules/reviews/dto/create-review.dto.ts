import { IsNumber, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  arenaId: string;

  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @Length(3, 500)
  content: string;
}
