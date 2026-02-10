import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ApiResponseUtil } from '../utils/api-response.util';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role)
      return ApiResponseUtil.throwError(
        'errors.general.forbidden',
        'NOT_ALLOWED',
        HttpStatus.FORBIDDEN,
      );

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole)
      return ApiResponseUtil.throwError(
        'errors.general.forbidden',
        'NOT_ALLOWED',
        HttpStatus.FORBIDDEN,
      );

    return true;
  }
}
