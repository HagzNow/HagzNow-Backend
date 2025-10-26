import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SortDto } from 'src/common/dtos/sort.dto';
import { ArenasService } from './arenas.service';
import { ArenaFilterDto } from './dto/arena-filter.dto';
import { CreateArenaDto } from './dto/create-arena.dto';
import { UpdateArenaDto } from './dto/update-arena.dto';

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
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filters: ArenaFilterDto,
    @Query() sort: SortDto,
  ) {
    console.log('here');
    return this.arenasService.findAll(paginationDto, filters, sort);
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
