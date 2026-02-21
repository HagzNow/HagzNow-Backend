import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ApiResponseUtil } from '../../common/utils/api-response.util';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/interfaces/userStatus.interface';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private mapToJwtPayload(user: User): JwtPayload {
    const { id, role, status } = user;
    return { id, role, status };
  }

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ token: string } | never> {
    const user = await this.usersService.findOneByEmail(email);
    let isMatch = false;
    if (user) isMatch = await bcrypt.compare(pass, user.password);
    if (!user || !isMatch)
      ApiResponseUtil.throwError(
        'errors.auth.invalid_credentials',
        'INVALID_CREDENTIALS',
        HttpStatus.UNAUTHORIZED,
      );
    if (user.status === UserStatus.RESTRICTED)
      return ApiResponseUtil.throwError(
        'errors.auth.user_restricted',
        'RESTRICTED_ACCOUNT',
        HttpStatus.FORBIDDEN,
        { reasonForRestriction: user.rejectionReason },
      );
    return {
      token: await this.jwtService.signAsync(this.mapToJwtPayload(user)),
    };
  }

  async signUp(
    data: RegisterDto,
  ): Promise<{ token: string; message?: string }> {
    const duplicateEmail = await this.usersService.findOneByEmail(data.email);
    if (duplicateEmail)
      ApiResponseUtil.throwError(
        'errors.auth.email_already_exists',
        'EMAIL_IN_USE',
        HttpStatus.CONFLICT,
      );
    const duplicatePhone = await this.usersService.findOneByPhone(data.phone);
    if (duplicatePhone)
      ApiResponseUtil.throwError(
        'errors.auth.phone_already_exists',
        'PHONE_IN_USE',
        HttpStatus.CONFLICT,
      );

    const role = data.role ?? UserRole.USER;
    const status =
      role === UserRole.OWNER ? UserStatus.PENDING : UserStatus.ACTIVE;
    const { role: _role, ...userData } = data;

    const user = await this.usersService.create(
      userData as CreateUserDto,
      role,
      status,
    );
    const token = await this.jwtService.signAsync(this.mapToJwtPayload(user));

    return { token };
  }

  async setNewPassword(
    currentUser: User,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string } | never> {
    const user = await this.usersService.findOneById(currentUser.id);
    if (user.status !== UserStatus.ACTIVE)
      return ApiResponseUtil.throwError(
        'errors.auth.account_inactive',
        'DEACTIVATED_ACCOUNT',
        HttpStatus.FORBIDDEN,
      );

    let isMatch = false;
    if (user) isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      ApiResponseUtil.throwError(
        'errors.auth.invalid_old_password',
        'INVALID_OLD_PASSWORD',
        HttpStatus.UNAUTHORIZED,
      );
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.usersService.updatePassword(user.id, hashedPassword);
  }
}
