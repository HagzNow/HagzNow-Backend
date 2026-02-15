import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ApiResponseUtil } from '../utils/api-response.util';
import { UserRole } from '../../modules/users/interfaces/userRole.interface';
import { UserStatus } from '../../modules/users/interfaces/userStatus.interface';

/**
 * Use after AuthGuard and RolesGuard on owner-only routes.
 * Ensures the owner's account is ACTIVE (blocks PENDING and REJECTED owners).
 */
@Injectable()
export class ActiveOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: string; status?: string } | undefined;

    if (!user || user.role !== UserRole.OWNER) return true;

    if (user.status !== UserStatus.ACTIVE) {
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
