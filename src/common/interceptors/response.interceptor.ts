import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponseUtil } from '../utils/api-response.util';
import { I18nService } from 'nestjs-i18n/dist/services/i18n.service';
import { I18nContext } from 'nestjs-i18n';
import { Language } from '../enums/language.enum';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly i18n: I18nService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const i18nContext = I18nContext.current();
    const lang = i18nContext?.lang || Language.ar;

    return next.handle().pipe(
      map((data) => {
        let translatedMessage;
        if (data?.message) {
          translatedMessage =
            this.i18n.translate(data.message, {
              lang,
            }) || data.message;
        }
        delete data?.message; // Remove the original message key from the response
        return ApiResponseUtil.success(data, translatedMessage);
      }),
    );
  }
}
