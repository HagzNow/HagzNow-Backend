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

const SENSITIVE_OWNER_FIELDS = [
  'nationalIdFront',
  'nationalIdBack',
  'selfieWithId',
] as const;

function stripOwnerIdFieldsFromPayload<T extends Record<string, unknown>>(
  payload: T,
): Omit<T, (typeof SENSITIVE_OWNER_FIELDS)[number]> {
  const result = { ...payload };
  for (const key of SENSITIVE_OWNER_FIELDS) {
    delete result[key];
  }
  return result as Omit<T, (typeof SENSITIVE_OWNER_FIELDS)[number]>;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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
    if (user.status === UserStatus.PENDING && user.role !== UserRole.OWNER)
      return ApiResponseUtil.throwError(
        'errors.auth.pending_account',
        'PENDING_ACCOUNT',
        HttpStatus.FORBIDDEN,
      );
    if (user.status === UserStatus.PENDING && user.role === UserRole.OWNER) {
      // Allow PENDING owners to sign in so they can submit ID images or check status
      const { password, ...result } = user;
      return {
        token: await this.jwtService.signAsync(
          stripOwnerIdFieldsFromPayload(result),
        ),
      };
    }
    if (user.status === UserStatus.REJECTED)
      return ApiResponseUtil.throwError(
        'errors.auth.rejected_account',
        'REJECTED_ACCOUNT',
        HttpStatus.FORBIDDEN,
      );
    else if (user.status !== UserStatus.ACTIVE)
      return ApiResponseUtil.throwError(
        'errors.auth.account_inactive',
        'DEACTIVATED_ACCOUNT',
        HttpStatus.FORBIDDEN,
      );
    const { password, ...result } = user;
    return {
      token: await this.jwtService.signAsync(result),
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
    const { password, ...result } = user;
    const token = await this.jwtService.signAsync(
      stripOwnerIdFieldsFromPayload(result),
    );

    return { token };
  }

  async setNewPassword(
    currentUser: User,
    oldPassword: string,
    newPassword: string,
  ): Promise<User | never> {
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

    return await this.usersService.update(user.id, { password: newPassword });
  }
}
