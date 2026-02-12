import { BadRequestException } from '@nestjs/common';
import { diskStorage, type Options as MulterOptions } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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

const ensureDirExists = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

export const createMulterOptions = (entity: UploadEntity): MulterOptions => {
  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const root = getUploadsRootDir();
        const entityDir = join(root, entity);
        try {
          ensureDirExists(entityDir);
          cb(null, entityDir);
        } catch (err) {
          cb(err as Error, '');
        }
      },
      filename: (req, file, cb) => {
        const uniqueName = uuidv4();
        const extension = file.originalname.includes('.')
          ? file.originalname.substring(file.originalname.lastIndexOf('.'))
          : '';
        cb(null, `${uniqueName}${extension}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|jpg|gif|webp)$/)) {
        return cb(
          new BadRequestException(
            `Unsupported file type ${file.originalname}. Only image files are allowed.`,
          ) as any,
          false,
        );
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB default max
    },
  };
};

