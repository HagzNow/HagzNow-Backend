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
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { Roles } from 'src/common/decorators/roles.decorator';
import { IdParamDto } from 'src/common/dtos/id-param.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SortDto } from 'src/common/dtos/sort.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserRole } from '../users/interfaces/userRole.interface';
import { ArenasService } from './arenas.service';
import { ArenaExtraDto } from './dto/arena-extra/arena-extra.dto';
import { ArenaDetailsDto } from './dto/arena/arena-details.dto';
import { ArenaFilterDto } from './dto/arena/arena-filter.dto';
import { ArenaSummaryDto } from './dto/arena/arena-summary.dto';
import { CreateArenaDto } from './dto/arena/create-arena.dto';
import { UpdateArenaStatusDto } from './dto/arena/update-arena-status.dto';
import { UpdateArenaDto } from './dto/arena/update-arena.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('arenas')
export class ArenasController {
  constructor(private readonly arenasService: ArenasService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ],
      {
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
        limits: { fileSize: 50 * 1024 * 1024 },
      },
    ),
  )
  create(
    @Body() createArenaDto: CreateArenaDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.arenasService.create(createArenaDto, files);
  }

  @Serialize(ArenaSummaryDto)
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filters: ArenaFilterDto,
    @Query() sort: SortDto,
  ) {
    return this.arenasService.findAll(paginationDto, filters, sort);
  }
  @Serialize(ArenaSummaryDto)
  @Roles(UserRole.ADMIN)
  @Get('requests')
  findRequests(@Query() paginationDto: PaginationDto) {
    return this.arenasService.findRequests(paginationDto);
  }

  @Serialize(ArenaDetailsDto)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arenasService.findOne(id);
  }

  @Serialize(ArenaExtraDto)
  @Get(':id/extras')
  getActiveExtras(@Param('id') id: string) {
    return this.arenasService.getActiveExtras(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArenaDto: UpdateArenaDto) {
    return this.arenasService.update(id, updateArenaDto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/:status')
  updateStatus(@Param() { id }: IdParamDto, @Body() dto: UpdateArenaStatusDto) {
    return this.arenasService.approve(id, dto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.arenasService.remove(id);
  }
}
