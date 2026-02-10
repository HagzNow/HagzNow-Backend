import { ExecutionContext, Injectable } from '@nestjs/common';
import { I18nResolver } from 'nestjs-i18n';

@Injectable()
export class UserLanguageResolver implements I18nResolver {
  resolve(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    // Priority 1: Authenticated user's stored preference
    if (request.user?.Language) {
      return request.user.Language;
    }

    return undefined; // Fall back to next resolver
  }
}
