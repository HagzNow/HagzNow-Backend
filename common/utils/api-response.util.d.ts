import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';
export declare class ApiResponseUtil {
    static success<T>(data: T, message?: string): ApiResponse<T>;
    static error<T>(message: string, code?: string, details?: string): ApiResponse<T>;
    static throwError(message: string, code?: string, status?: HttpStatus, details?: string): never;
}
