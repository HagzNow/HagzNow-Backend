export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  error?: {
    code?: string;
    details?: string;
  } | null;
}
