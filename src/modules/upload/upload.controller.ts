import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UseInterceptors,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { UploadService } from './upload.service';
import { UploadEntity } from './multer.config';

const resolveUploadEntity = (entityParam: string): UploadEntity => {
  const normalized = entityParam?.toLowerCase();
  switch (normalized) {
    case UploadEntity.USERS:
      return UploadEntity.USERS;
    case UploadEntity.BOOKINGS:
      return UploadEntity.BOOKINGS;
    case UploadEntity.ADS:
      return UploadEntity.ADS;
    case UploadEntity.ARENAS:
      return UploadEntity.ARENAS;
    case UploadEntity.AUTH:
      return UploadEntity.AUTH;
    case UploadEntity.REVIEWS:
      return UploadEntity.REVIEWS;
    case UploadEntity.CATEGORIES:
      return UploadEntity.CATEGORIES;
    default:
      throw new BadRequestException(
        `Unsupported upload entity "${entityParam}".`,
      );
  }
};

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Generic upload endpoint:
   * POST /upload/:entity
   * Body: multipart/form-data with field "image"
   * Returns: { url: `${BASE_URL}/uploads/{entity}/{uuid}.webp` }
   */
  @Post(':entity')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
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
    }),
  )
  async uploadImage(
    @Param('entity') entityParam: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided. Expected field "image".');
    }

    const entity = resolveUploadEntity(entityParam);
    const relativePath = await this.uploadService.processImage(file, entity);

    const baseUrl =
      process.env.BASE_URL ||
      `${req.protocol}://${req.get('host') ?? 'localhost'}`;

    return {
      url: `${baseUrl}/uploads/${relativePath}`,
    };
  }
}

