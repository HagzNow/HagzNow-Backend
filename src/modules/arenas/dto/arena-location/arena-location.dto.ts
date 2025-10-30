import { Expose } from 'class-transformer';

export class ArenaLocationDto {
  @Expose()
  id: string;

  @Expose()
  lat: number;

  @Expose()
  lng: number;

  @Expose()
  governorate: string;

  @Expose()
  city: string;
}
