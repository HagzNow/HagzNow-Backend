import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SortDto } from 'src/common/dtos/sort.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import {
  applyExactFilters,
  applyILikeFilters,
} from 'src/common/utils/filter.utils';
import { paginate } from 'src/common/utils/paginate';
import { applySorting } from 'src/common/utils/sort.util';
import {
  DeepPartial,
  EntityManager,
  In,
  IsNull,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/entities/user.entity';
import { ArenaFilterDto } from './dto/arena/arena-filter.dto';
import { CreateArenaDto } from './dto/arena/create-arena.dto';
import { UpdateArenaDto } from './dto/arena/update-arena.dto';
import { ArenaExtra } from '../arena-extras/entities/arena-extra.entity';
import { ArenaImage } from './entities/arena-image.entity';
import { Arena } from './entities/arena.entity';
import { ArenaStatus } from './interfaces/arena-status.interface';
import { UploadService } from '../upload/upload.service';
import { UploadEntity } from '../upload/multer.config';

@Injectable()
export class ArenasService {
  constructor(
    @InjectRepository(Arena)
    private readonly arenaRepository: Repository<Arena>,
    @InjectRepository(ArenaImage)
    private readonly arenaImageRepository: Repository<ArenaImage>,
    private readonly categoriesService: CategoriesService,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    createArenaDto: CreateArenaDto,
    owner: User,
  ): Promise<Arena | never> {
    const { categoryId, ...arenaData } = createArenaDto;

    // Use thumbnail and images paths directly from DTO (already uploaded via POST /upload/arenas)
    const thumbnailPath = createArenaDto.thumbnail || '';
    const imagesPath =
      createArenaDto.images?.map((img) => ({ path: img.path })) || [];

    const arena = this.arenaRepository.create({
      ...arenaData,
      thumbnail: thumbnailPath,
      images: imagesPath,
      owner,
    } as DeepPartial<Arena>);

    if (categoryId) {
      const category = await this.categoriesService.findOne(categoryId);
      if (!category)
        return ApiResponseUtil.throwError(
          'errors.category.not_found',
          'CATEGORY_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
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
      .leftJoinAndSelect('arenas.reviews', 'review')
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
      .leftJoinAndSelect('arenas.category', 'category')
      .where('arenas.status = :status', { status: ArenaStatus.PENDING });

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
    const query = this.arenaRepository
      .createQueryBuilder('arenas')
      .leftJoinAndSelect('arenas.reviews', 'review')
      .leftJoinAndSelect('arenas.location', 'location')
      .leftJoinAndSelect('arenas.category', 'category')
      .leftJoinAndSelect('arenas.owner', 'owner')
      .where('arenas.ownerId = :ownerId', { ownerId });
    this.applyFilters(query, filters);
    return await paginate(query, paginationDto);
  }
  async getNumberOfArenasByOwner(ownerId: string) {
    const count = await this.arenaRepository.count({
      where: { owner: { id: ownerId } },
    });
    return count;
  }

  async findNamesByOwner(ownerId: string) {
    return await this.arenaRepository
      .createQueryBuilder('arena')
      .select(['arena.id as id', 'arena.name as name'])
      .where('arena.ownerId = :ownerId', { ownerId })
      .getRawMany();
  }
  async findAllDetailed(categoryId: string): Promise<Arena[] | never> {
    const category = await this.categoriesService.findOne(categoryId);
    if (!category) {
      return ApiResponseUtil.throwError(
        'errors.category.not_found',
        'CATEGORY_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.arenaRepository.find({
      where: { category: { id: categoryId } },
      relations: [
        'location',
        'category',
        'owner',
        'reviews',
        'images',
        'extras',
      ],
    });
  }

  async findOne(id: string, manager?: EntityManager): Promise<Arena | never> {
    // In case id is undefined or null without this it will return first value
    if (!id)
      return ApiResponseUtil.throwError(
        'errors.arena.not_found',
        'ARENA_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );

    const repo = manager ? manager.getRepository(Arena) : this.arenaRepository;
    const arena = await repo.findOneBy({ id });
    if (!arena) {
      return ApiResponseUtil.throwError(
        'errors.arena.not_found',
        'ARENA_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return arena;
  }

  async getDistinctGovernorate() {
    const governorate = await this.arenaRepository
      .createQueryBuilder('arena')
      .leftJoin('arena.location', 'location')
      .select('DISTINCT location.governorate', 'governorate')
      .where('arena.status = :status', { status: 'active' })
      .getRawMany();
    return governorate
      .map((c) => c.governorate)
      .filter((governorate) => governorate !== null);
  }

  async update(
    id: string,
    updateArenaDto: UpdateArenaDto,
    owner: User,
  ): Promise<Arena | never> {
    const arena = await this.arenaRepository.findOne({
      where: { id },
      relations: ['images', 'location'], // Load relations if needed
    });

    if (!arena) {
      return ApiResponseUtil.throwError(
        'errors.arena.not_found',
        'ARENA_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    if (arena.owner.id !== owner.id) {
      return ApiResponseUtil.throwError(
        'errors.arena.unauthorized_update',
        'UNAUTHORIZED',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Capture paths to delete from storage after save succeeds
    let oldThumbnailPath: string | undefined;
    if (
      updateArenaDto.thumbnail &&
      updateArenaDto.thumbnail !== arena.thumbnail &&
      arena.thumbnail
    ) {
      oldThumbnailPath = arena.thumbnail;
    }

    let oldImagePathsToDelete: string[] = [];
    if (updateArenaDto.images !== undefined) {
      const newImagePaths = updateArenaDto.images
        .map((img) => img.path)
        .filter((path): path is string => typeof path === 'string' && path.length > 0);
      const oldImagePaths = arena.images?.map((img) => img.path) || [];
      oldImagePathsToDelete = oldImagePaths.filter(
        (oldPath) => !newImagePaths.includes(oldPath),
      );
    }

    // Merge first so DTO does not overwrite our images handling later
    this.arenaRepository.merge(arena, updateArenaDto);

    // Apply thumbnail (assign new path; file delete happens after save)
    if (updateArenaDto.thumbnail) {
      arena.thumbnail = updateArenaDto.thumbnail;
    }

    // Apply images: delete existing DB rows, then set new list
    if (updateArenaDto.images !== undefined) {
      await this.arenaImageRepository.delete({ arena: { id: arena.id } });

      const newImagePaths: string[] = updateArenaDto.images
        .map((img) => img.path)
        .filter((path): path is string => typeof path === 'string' && path.length > 0);

      const newImages = newImagePaths.map((p: string) => {
        const image = new ArenaImage();
        image.path = p;
        image.arena = arena;
        return image;
      });
      arena.images = newImages;
    }

    const savedArena = await this.arenaRepository.save(arena);

    // Delete old files from storage only after save succeeded
    if (oldThumbnailPath) {
      await this.uploadService.deleteImage(oldThumbnailPath);
    }
    for (const pathToDelete of oldImagePathsToDelete) {
      await this.uploadService.deleteImage(pathToDelete);
    }

    return savedArena;
  }

  async approve(id: string, status: ArenaStatus) {
    const arena = await this.arenaRepository.findOneBy({ id });
    if (!arena) {
      return ApiResponseUtil.throwError(
        'errors.arena.not_found',
        'ARENA_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    if (arena.status !== ArenaStatus.PENDING) {
      return ApiResponseUtil.throwError(
        'errors.arena.invalid_arena_status',
        'INVALID_ARENA_STATUS',
        HttpStatus.BAD_REQUEST,
      );
    }

    arena.status = status;
    return await this.arenaRepository.save(arena);
  }

  async remove(id: string) {
    return await this.arenaRepository.delete(id);
  }

  async getTotalArenaSlotsCount(
    ownerId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const today = new Date();
    // Set default date range to last month to today if not provided
    if (!startDate) {
      startDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate() + 1, // ✔ correct
      );
    }
    if (!endDate) {
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );
    }
    const totalDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
    const arenas = await this.arenaRepository
      .createQueryBuilder('arena')
      .where('arena.ownerId = :ownerId', { ownerId })
      .getMany();
    const totalAvailableSlots = arenas.reduce((total, arena) => {
      return total + arena.totalAvailableHours() * totalDays;
    }, 0);
    return totalAvailableSlots;
  }

  async getMostReservedArenaByOwner(
    ownerId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const today = new Date();
    // Set default date range to last month to today if not provided
    if (!startDate) {
      startDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate() + 1, // ✔ correct
      );
    }
    if (!endDate) {
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );
    }

    const result = await this.arenaRepository
      .createQueryBuilder('arena')
      .leftJoin('arena.reservations', 'reservation')
      .where('arena.ownerId = :ownerId', { ownerId })
      .andWhere(
        'reservation.dateOfReservation BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      )
      .select('arena.id', 'arenaId')
      .addSelect('arena.name', 'arenaName')
      .addSelect('COUNT(reservation.id)', 'reservationCount')
      .groupBy('arena.id')
      .orderBy('COUNT(reservation.id)', 'DESC')
      .limit(1)
      .getRawOne();

    return result;
  }

  private applyFilters<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    filters: ArenaFilterDto,
  ) {
    const alias = 'arenas';
    applyExactFilters(query, { categoryId: filters.categoryId }, alias);
    applyILikeFilters(query, { name: filters.name }, alias);
    applyExactFilters(query, { governorate: filters.governorate }, 'location');
  }
}
