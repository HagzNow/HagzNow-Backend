import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UseImageUpload } from 'src/common/decorators/use-image-upload.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SortDto } from 'src/common/dtos/sort.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { ArenasService } from './arenas.service';
import { ArenaExtraDto } from './dto/arena-extra/arena-extra.dto';
import { ArenaDetailsDto } from './dto/arena/arena-details.dto';
import { ArenaFilterDto } from './dto/arena/arena-filter.dto';
import { ArenaSummaryDto } from './dto/arena/arena-summary.dto';
import { CreateArenaDto } from './dto/arena/create-arena.dto';
import { UpdateArenaStatusDto } from './dto/arena/update-arena-status.dto';
import { UpdateArenaDto } from './dto/arena/update-arena.dto';

@Controller('arenas')
export class ArenasController {
  constructor(private readonly arenasService: ArenasService) {}

  @Serialize(ArenaDetailsDto)
  @Roles(UserRole.OWNER)
  @Post()
  @UseImageUpload([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ])
  create(
    @Body() createArenaDto: CreateArenaDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
    @CurrentUser() owner: User,
  ) {
    return this.arenasService.create(createArenaDto, owner, files);
  }

  @Serialize(ArenaDetailsDto)
  @Get('detailed')
  findAllDetailed(@Body('categoryId') categoryId: string) {
    return this.arenasService.findAllDetailed(categoryId);
  }

  @Get('governorate')
  getDistinctGovernorate() {
    return this.arenasService.getDistinctGovernorate();
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
  findRequests(
    @Query() paginationDto: PaginationDto,
    @Query() filters: ArenaFilterDto,
  ) {
    return this.arenasService.findRequests(paginationDto, filters);
  }

  @Serialize(ArenaSummaryDto)
  @Roles(UserRole.OWNER)
  @Get('owner')
  async getOwnerArenas(
    @CurrentUser() owner: User,
    @Query() paginationDto: PaginationDto,
    @Query() filters: ArenaFilterDto,
  ) {
    return await this.arenasService.findByOwner(
      owner.id,
      paginationDto,
      filters,
    );
  }
  @Roles(UserRole.OWNER)
  @Get('owner/names')
  async getOwnerArenasNames(@CurrentUser() owner: User) {
    return await this.arenasService.findNamesByOwner(owner.id);
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
  @Roles(UserRole.OWNER)
  update(
    @Param('id') id: string,
    @Body() updateArenaDto: UpdateArenaDto,
    @CurrentUser() owner: User,
  ) {
    return this.arenasService.update(id, updateArenaDto, owner);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/:status')
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateArenaStatusDto,
  ) {
    return this.arenasService.approve(id, dto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.arenasService.remove(id);
  }
}
