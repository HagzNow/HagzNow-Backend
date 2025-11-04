import { Expose } from 'class-transformer';
import { UserRole } from '../interfaces/userRole.interface';
import { UserStatus } from '../interfaces/userStatus.interface';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  fName: string;

  @Expose()
  lName: string;

  @Expose()
  role: UserRole;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  status: UserStatus;
}
