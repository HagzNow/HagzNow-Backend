import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../interfaces/userRole.interface';
import { UserStatus } from '../interfaces/userStatus.interface';

export class UserFilterDto {
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be either active or disabled' })
  status: UserStatus;

  @IsOptional()
  @IsEnum(UserRole, {
    message: 'Role must be in these values user, owner or admin',
  })
  role: UserRole;
}
