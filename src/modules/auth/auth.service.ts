import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ApiResponseUtil } from '../common/utils/api-response.util';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

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
}
