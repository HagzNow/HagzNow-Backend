import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SortDto } from 'src/common/dtos/sort.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { applyFilters } from 'src/common/utils/filter.utils';
import { paginate } from 'src/common/utils/paginate';
import { applySorting } from 'src/common/utils/sort.util';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { ArenaFilterDto } from './dto/arena/arena-filter.dto';
import { CreateArenaDto } from './dto/arena/create-arena.dto';
import { UpdateArenaDto } from './dto/arena/update-arena.dto';
import { ArenaExtra } from './entities/arena-extra.entity';
import { Arena } from './entities/arena.entity';
import { ArenaStatus } from './interfaces/arena-status.interface';
import axios from 'axios';
import { Readable } from 'stream';
import FormData from 'form-data';

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
    files?: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const { categoryId, ...arenaData } = createArenaDto;

    let thumbnail = '';
    let uploadedImages = [];

    // Helper function to upload to sersawy.com
    const uploadToSersawy = async (files: Express.Multer.File[]) => {
      const formData = new FormData();

      for (const file of files) {
        const stream = Readable.from(file.buffer);
        formData.append('images[]', stream, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      }

      const response = await axios.post(
        'https://api.sersawy.com/images/',
        formData,
        {
          headers: formData.getHeaders(),
        },
      );

      if (response.data?.success) {
        return response.data.files.map((f) => ({
          path: f.url,
          filename: f.filename,
          size: f.size,
          width: f.dimensions?.width,
          height: f.dimensions?.height,
        }));
      }

      throw new Error('Upload failed: ' + JSON.stringify(response.data));
    };

    try {
      // Upload thumbnail if provided
      if (files?.thumbnail?.length) {
        const uploaded = await uploadToSersawy(files.thumbnail);
        thumbnail = uploaded[0].path; // ✅ store only URL string
      }

      // Upload gallery images
      if (files?.images?.length) {
        uploadedImages = await uploadToSersawy(files.images);
      }
    } catch (err) {
      console.error(
        '❌ Error uploading to sersawy.com:',
        err.response?.data || err.message,
      );
      throw err;
    }
    console.log(thumbnail);
    console.log(thumbnail);

    // Save Arena with remote URLs
    const arena = this.arenaRepository.create({
      ...arenaData,
      thumbnail,
      images: uploadedImages,
    });

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
    applyFilters(query, filters, 'arenas');

    // Apply sorting dynamically
    if (orderBy) {
      applySorting(query, { [orderBy]: direction }, 'arenas');
    }

    // Paginate (using your existing paginate util)
    return paginate(query, paginationDto);
  }

  async findRequests(paginationDto: PaginationDto) {
    // Start a query builder
    const query = this.arenaRepository
      .createQueryBuilder('arenas')
      .leftJoinAndSelect('arenas.location', 'location')
      .leftJoinAndSelect('arenas.category', 'category');

    // Paginate (using your existing paginate util)
    return paginate(query, paginationDto);
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
}
