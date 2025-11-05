import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ApiResponseUtil } from '../../common/utils/api-response.util';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/interfaces/userStatus.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    let isMatch = false;
    if (user) isMatch = await bcrypt.compare(pass, user.password);
    if (!user || !isMatch)
      ApiResponseUtil.throwError(
        'Email or password is incorrect',
        'INVALID_CREDENTIALS',
        HttpStatus.UNAUTHORIZED,
      );
    if (user.status !== UserStatus.ACTIVE)
      ApiResponseUtil.throwError(
        'User account is not active',
        'INACTIVE_ACCOUNT',
        HttpStatus.FORBIDDEN,
      );
    const { password, ...result } = user;
    return {
      token: await this.jwtService.signAsync(result),
    };
  }
  async signUp(data: CreateUserDto): Promise<any> {
    const checkUser = await this.usersService.findOne(data.email);
    if (checkUser)
      ApiResponseUtil.throwError(
        'Email already in use',
        'EMAIL_IN_USE',
        HttpStatus.CONFLICT,
      );

    const user = await this.usersService.create(data);
    const { password, ...result } = user;
    return {
      token: await this.jwtService.signAsync(result),
    };
  }

  async setNewPassword(
    currentUser: User,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findOneById(currentUser.id);
    if (!user)
      ApiResponseUtil.throwError(
        'User not found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    if (user.status !== UserStatus.ACTIVE)
      ApiResponseUtil.throwError(
        'User account is not active',
        'INACTIVE_ACCOUNT',
        HttpStatus.FORBIDDEN,
      );

    let isMatch = false;
    if (user) isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      ApiResponseUtil.throwError(
        'Old password is incorrect',
        'INVALID_OLD_PASSWORD',
        HttpStatus.UNAUTHORIZED,
      );

    return await this.usersService.update(user.id, { password: newPassword });
  }
}
