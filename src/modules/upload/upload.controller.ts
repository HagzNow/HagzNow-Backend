import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import {
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadEntity } from './multer.config';
import { UploadResponseDto } from './dto/upload-response.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

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

@ApiTags('Upload')
@Controller('upload')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Generic upload endpoint:
   * POST /upload/:entity
   * Body: multipart/form-data with field "image"
   * Returns: { path: "entity/uuid.webp", url: "${BASE_URL}/uploads/entity/uuid.webp" }
   * All entities require authentication.
   */
  @Post(':entity')
  @ApiOperation({
    summary: 'Upload a single image',
    description:
      'Upload an image for a specific entity. Returns both relative path and full URL. Requires authentication.',
  })
  @ApiParam({
    name: 'entity',
    enum: UploadEntity,
    description: 'Entity type (users, arenas, auth, etc.)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, jpeg, png, gif, webp)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or missing file',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided. Expected field "image".');
    }

    const entity = resolveUploadEntity(entityParam);

    // Owner-only: ID images (auth entity) may only be uploaded by owners
    if (entity === UploadEntity.AUTH) {
      const user = (req as Request & { user?: { role?: string } }).user;
      if (user?.role !== 'owner') {
        throw new ForbiddenException('errors.general.forbidden');
      }
    }
    const relativePath = await this.uploadService.processImage(file, entity);

    const baseUrl =
      process.env.BASE_URL ||
      `${req.protocol}://${req.get('host') ?? 'localhost'}`;

    const url = this.uploadService.buildUploadUrl(relativePath, baseUrl);

    return {
      path: relativePath,
      url,
    };
  }
}

