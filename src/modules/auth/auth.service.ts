import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);

    if (!user) throw new UnauthorizedException();
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    return {
      token: await this.jwtService.signAsync(result),
    };
  }
  async signUp(data: CreateUserDto): Promise<any> {
    const checkUser = await this.usersService.findOne(data.email);
    if (checkUser) throw new UnauthorizedException();
    const user = await this.usersService.create(data);
    const { password, ...result } = user;
    return {
      token: await this.jwtService.signAsync(result),
    };
  }
}
