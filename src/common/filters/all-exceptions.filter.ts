import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { raw, Response } from 'express';
import { ApiResponseUtil } from '../utils/api-response.util';
import { I18nContext } from 'nestjs-i18n';
import { Language } from '../enums/language.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const i18n = I18nContext.current();
    const lang = i18n?.lang || Language.ar;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string | undefined = undefined;
    let messageKey = 'errors.general.internal_server_error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();

      // Take code only if explicitly provided in the exception
      code = res?.error?.code ?? code;
      details = res.error?.details ?? undefined;
      // Handle validation messages (array of messages)
      if (Array.isArray(res?.message)) {
        messageKey = res.message[0];
      } else {
        messageKey = res?.message ?? messageKey;
      }
    }

    const rawMessage =
      i18n?.translate(messageKey, { lang, args: details }) || messageKey;
    console.error('Error occurred:', rawMessage, 'Details:', details);

    // const rawMessage =
    //   i18n?.translate(messageKey, { lang, args: details }) ?? messageKey;
    const message = typeof rawMessage === 'string' ? rawMessage : messageKey;
    const errorResponse = ApiResponseUtil.error(message, code, details);
    response.status(status).json(errorResponse);
  }
}
