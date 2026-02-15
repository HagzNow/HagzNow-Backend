import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ApiResponseUtil } from '../utils/api-response.util';
import { UserStatus } from '../../modules/users/interfaces/userStatus.interface';
import { UserRole } from 'src/modules/users/interfaces/userRole.interface';

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

    // for verification of active status for owners, and pending/rejected status for all users
    if (user.role === UserRole.OWNER && user.status !== UserStatus.ACTIVE) {
      const messageKey =
        user.status === UserStatus.REJECTED
          ? 'errors.auth.rejected_account'
          : 'errors.auth.pending_account';
      const code =
        user.status === UserStatus.REJECTED
          ? 'REJECTED_ACCOUNT'
          : 'PENDING_ACCOUNT';
      return ApiResponseUtil.throwError(messageKey, code, HttpStatus.FORBIDDEN);
    }
    return true;
  }
}
