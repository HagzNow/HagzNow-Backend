import { join } from 'path';

export enum UploadEntity {
  USERS = 'users',
  BOOKINGS = 'bookings',
  ADS = 'ads',
  ARENAS = 'arenas',
  AUTH = 'auth',
  REVIEWS = 'reviews',
  CATEGORIES = 'categories',
}

export const getUploadsRootDir = (): string => {
  // Default to ./uploads inside the app root; in Docker this should be mapped to /app/uploads
  return process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
};
