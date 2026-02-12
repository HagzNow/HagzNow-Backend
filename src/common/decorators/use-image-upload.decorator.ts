// src/common/decorators/use-image-upload.decorator.ts
import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export function UseImageUpload(fields: { name: string; maxCount?: number }[]) {
  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(fields, {
        storage: memoryStorage(),
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.match(/^image\/(jpeg|png|jpg|gif|webp)$/)) {
            return cb(
              new BadRequestException(
                `Unsupported file type ${file.originalname}. Only image files are allowed.`,
              ),
              false,
            );
          }
          cb(null, true);
        },
        // Align with default upload limits (5MB per file)
        limits: { fileSize: 5 * 1024 * 1024 },
      }),
    ),
  );
}
