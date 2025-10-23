import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { ArenasService } from './arenas.service';
import { CreateArenaDto } from './dto/create-arena.dto';
import { UpdateArenaDto } from './dto/update-arena.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

@Controller('arenas')
export class ArenasController {
  constructor(private readonly arenasService: ArenasService) {}

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/arenas',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),

      // 👇 Only allow image MIME types
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg|gif|webp)$/)) {
          return cb(
            new BadRequestException(
              `Unsupported file type ${extname(file.originalname)}. Only image files are allowed.`,
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 500 * 1024 * 1024,
      },
    }),
  )
  create(
    @Body() createArenaDto: CreateArenaDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.arenasService.create(createArenaDto, files);
  }

  @Get()
  findAll() {
    return this.arenasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arenasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArenaDto: UpdateArenaDto) {
    return this.arenasService.update(+id, updateArenaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.arenasService.remove(+id);
  }
}
