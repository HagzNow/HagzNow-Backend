import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ApiResponseUtil } from '../../common/utils/api-response.util';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/interfaces/userStatus.interface';
import { User } from '../users/entities/user.entity';
import { CreateOwnerDto } from '../users/dto/create-owner.dto';
import { UserRole } from '../users/interfaces/userRole.interface';

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

  async signUpUser(data: CreateUserDto): Promise<{ token: string }> {
    return await this.signUp(data, UserRole.USER, UserStatus.ACTIVE);
  }
  async signUpOwner(
    data: CreateOwnerDto,
  ): Promise<{ token: string; message: string }> {
    const { token } = await this.signUp(data, UserRole.OWNER, UserStatus.PENDING);
    return {
      token,
      message: 'messages.auth.owner_registration_pending',
    };
  }
  async signUp(
    data: CreateUserDto | CreateOwnerDto,
    role: UserRole = UserRole.USER,
    status: UserStatus = UserStatus.ACTIVE,
  ): Promise<{ token: string } | never> {
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

    // Data already contains paths for owner registration (nationalIdFront, nationalIdBack, selfieWithId)
    // No file processing needed - paths come from client

    const user = await this.usersService.create(data, role, status);
    const { password, ...result } = user;
    return {
      token: await this.jwtService.signAsync(
        stripOwnerIdFieldsFromPayload(result),
      ),
    };
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
