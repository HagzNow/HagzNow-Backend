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
import { UploadService } from '../upload/upload.service';
import { UploadEntity } from '../upload/multer.config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private uploadService: UploadService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ token: string } | never> {
    const user = await this.usersService.findOneByEmail(email);
    let isMatch = false;
    if (user) isMatch = await bcrypt.compare(pass, user.password);
    if (!user || !isMatch)
      ApiResponseUtil.throwError(
        'errors.auth.invalid_credentials',
        'INVALID_CREDENTIALS',
        HttpStatus.UNAUTHORIZED,
      );
    if (user.status === UserStatus.PENDING)
      return ApiResponseUtil.throwError(
        'errors.auth.pending_account',
        'PENDING_ACCOUNT',
        HttpStatus.FORBIDDEN,
      );
    else if (user.status === UserStatus.REJECTED)
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
    files: {
      nationalIdFront?: Express.Multer.File[];
      nationalIdBack?: Express.Multer.File[];
      selfieWithId?: Express.Multer.File[];
    },
  ): Promise<{ message: string }> {
    await this.signUp(data, UserRole.OWNER, UserStatus.PENDING, files);
    return { message: 'messages.auth.owner_registration_pending' };
  }
  async signUp(
    data: CreateUserDto | CreateOwnerDto,
    role: UserRole = UserRole.USER,
    status: UserStatus = UserStatus.ACTIVE,
    files?: {
      nationalIdFront?: Express.Multer.File[];
      nationalIdBack?: Express.Multer.File[];
      selfieWithId?: Express.Multer.File[];
    },
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
    if (files && data instanceof CreateOwnerDto) {
      const frontFile = files.nationalIdFront?.[0];
      const backFile = files.nationalIdBack?.[0];
      const selfieFile = files.selfieWithId?.[0];

      if (frontFile) {
        data.nationalIdFront = await this.uploadService.processImage(
          frontFile,
          UploadEntity.AUTH,
        );
      }
      if (backFile) {
        data.nationalIdBack = await this.uploadService.processImage(
          backFile,
          UploadEntity.AUTH,
        );
      }
      if (selfieFile) {
        data.selfieWithId = await this.uploadService.processImage(
          selfieFile,
          UploadEntity.AUTH,
        );
      }
    }

    const user = await this.usersService.create(data, role, status);
    const { password, ...result } = user;
    return {
      token: await this.jwtService.signAsync(result),
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
