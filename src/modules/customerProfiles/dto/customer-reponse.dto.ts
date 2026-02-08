import { Expose } from 'class-transformer';

export class CustomerResponseDto {
  @Expose()
  id: string;

  @Expose()
  fName: string;

  @Expose()
  lName: string;

  @Expose()
  phone: string;
}
