import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SortDto } from 'src/common/dtos/sort.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import {
  applyExactFilters,
  applyILikeFilters,
} from 'src/common/utils/filter.utils';
import { handleImageUpload } from 'src/common/utils/handle-image-upload.util';
import { paginate } from 'src/common/utils/paginate';
import { applySorting } from 'src/common/utils/sort.util';
import {
  DeepPartial,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/entities/user.entity';
import { ArenaFilterDto } from './dto/arena/arena-filter.dto';
import { CreateArenaDto } from './dto/arena/create-arena.dto';
import { UpdateArenaDto } from './dto/arena/update-arena.dto';
import { ArenaExtra } from './entities/arena-extra.entity';
import { Arena } from './entities/arena.entity';
import { ArenaStatus } from './interfaces/arena-status.interface';

@Injectable()
export class ArenasService {
  constructor(
    @InjectRepository(Arena)
    private readonly arenaRepository: Repository<Arena>,
    @InjectRepository(ArenaExtra)
    private readonly extraRepository: Repository<ArenaExtra>,

    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    createArenaDto: CreateArenaDto,
    owner: User,
    files?: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const { categoryId, ...arenaData } = createArenaDto;

    const { thumbnail, images } = await handleImageUpload({
      thumbnail: files?.thumbnail,
      images: files?.images,
    });
    let imagesPath = images.map((imgPath) => {
      return { path: imgPath };
    });
    const arena = this.arenaRepository.create({
      ...arenaData,
      thumbnail: thumbnail[0],
      images: imagesPath,
      owner,
    } as DeepPartial<Arena>);

    if (categoryId) {
      const category = await this.categoriesService.findOne(categoryId);
      if (!category)
        throw new NotFoundException(`Category ${categoryId} not found`);
      arena.category = category;
    }

    return await this.arenaRepository.save(arena);
  }
  async findAll(
    paginationDto: PaginationDto,
    filters: ArenaFilterDto,
    sort: SortDto,
  ) {
    const { orderBy, direction } = sort;
    // Start a query builder
    const query = this.arenaRepository
      .createQueryBuilder('arenas')
      .leftJoinAndSelect('arenas.location', 'location')
      .leftJoinAndSelect('arenas.category', 'category')
      .where('arenas.status = :status', { status: 'active' });

    // Apply filters dynamically
    this.applyFilters(query, filters);
    // Apply sorting dynamically
    if (orderBy) {
      applySorting(query, { [orderBy]: direction }, 'arenas');
    }

    // Paginate (using your existing paginate util)
    return paginate(query, paginationDto);
  }

  async findRequests(paginationDto: PaginationDto, filters: ArenaFilterDto) {
    // Start a query builder
    const query = this.arenaRepository
      .createQueryBuilder('arenas')
      .leftJoinAndSelect('arenas.location', 'location')
      .leftJoinAndSelect('arenas.category', 'category');

    // Apply filters dynamically
    this.applyFilters(query, filters);
    // Paginate (using your existing paginate util)
    return paginate(query, paginationDto);
  }

  async findByOwner(
    ownerId: string,
    paginationDto: PaginationDto,
    filters: ArenaFilterDto,
  ) {
    console.log(`OWNER ID = ${ownerId}`);
    const query = this.arenaRepository
      .createQueryBuilder('arenas')
      .leftJoinAndSelect('arenas.owner', 'owner')
      .where('arenas.ownerId = :ownerId', { ownerId });
    this.applyFilters(query, filters);
    return await paginate(query, paginationDto);
  }

  async findOne(id: string) {
    if (!id) return null;
    return await this.arenaRepository.findOneBy({ id });
  }

  async getActiveExtras(arenaId: string) {
    return this.extraRepository.find({
      where: { arena: { id: arenaId }, isActive: true },
    });
  }

  async update(id: string, updateArenaDto: UpdateArenaDto) {
    const arena = await this.arenaRepository.findOne({
      where: { id },
      relations: ['images', 'location'], // Load relations if needed
    });

    if (!arena) {
      throw new NotFoundException('Arena not found');
    }

    // TODO fix update image
    this.arenaRepository.merge(arena, updateArenaDto);

    return await this.arenaRepository.save(arena);
  }

  async approve(id: string, status: ArenaStatus) {
    const arena = await this.arenaRepository.findOneBy({ id });
    if (!arena) {
      return ApiResponseUtil.throwError(
        'ARENA_NOT_FOUND',
        'Arena not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (arena.status !== ArenaStatus.PENDING) {
      return ApiResponseUtil.throwError(
        'INVALID_ARENA_STATUS',
        'Only pending arenas can be approved',
        HttpStatus.BAD_REQUEST,
      );
    }

    arena.status = status;
    return await this.arenaRepository.save(arena);
  }

  async remove(id: string) {
    return await this.arenaRepository.delete(id);
  }

  private applyFilters<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    filters: ArenaFilterDto,
  ) {
    const alias = 'arenas';
    applyExactFilters(query, { categoryId: filters.categoryId }, alias);
    applyILikeFilters(query, { name: filters.name }, alias);
  }
}
