import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../interfaces/userRole.interface';
import { UserStatus } from '../interfaces/userStatus.interface';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class UserFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be either active or disabled' })
  status: UserStatus;

  @IsOptional()
  @IsEnum(UserRole, {
    message: 'Role must be in these values user, owner or admin',
  })
  role: UserRole;
}
