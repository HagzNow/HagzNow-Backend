import { UserRole } from '../../users/interfaces/userRole.interface';
import { UserStatus } from '../../users/interfaces/userStatus.interface';
export class JwtPayload {
  id: string;
  role: UserRole;
  status: UserStatus;
  email: string;
  phone: string;
}
