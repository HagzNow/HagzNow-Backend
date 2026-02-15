import { IsIn, IsOptional } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UserRole } from '../../users/interfaces/userRole.interface';

export class RegisterDto extends CreateUserDto {
  @IsOptional()
  @IsIn([UserRole.USER, UserRole.OWNER], {
    message: 'errors.auth.invalid_register_role',
  })
  role?: UserRole;
}
