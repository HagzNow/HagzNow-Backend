import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';

export class ApiResponseUtil {
  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      isSuccess: true,
      message,
      data,
      error: null,
    };
  }

  static error<T>(
    message: string,
    code?: string,
    details?: string,
  ): ApiResponse<T> {
    return {
      isSuccess: false,
      message,
      data: null,
      error: { code, details },
    };
  }

  static throwError(
    message: string,
    code = 'INTERNAL_ERROR',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: string,
  ): never {
    throw new HttpException(
      ApiResponseUtil.error(message, code, details),
      status,
    );
  }
}
