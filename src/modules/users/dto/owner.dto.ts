import { Expose } from 'class-transformer';
import { UserDto } from './user.dto';

export class OwnerDto extends UserDto {
  @Expose()
  nationalIdFront: string;
  @Expose()
  nationalIdBack: string;
  @Expose()
  selfieWithId: string;
}
