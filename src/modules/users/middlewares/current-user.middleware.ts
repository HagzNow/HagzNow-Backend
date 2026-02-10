import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return next(); // no token, just continue

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return next();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // attach user payload to request
      req['user'] = payload;
    } catch (err) {
      // you can choose to throw or ignore
      throw new UnauthorizedException('errors.auth.invalid_token');
    }

    next();
  }
}
