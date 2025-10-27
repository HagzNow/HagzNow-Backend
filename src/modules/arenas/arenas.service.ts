import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SortDto } from 'src/common/dtos/sort.dto';
import { applyFilters } from 'src/common/utils/filter.utils';
import { paginate } from 'src/common/utils/paginate';
import { applySorting } from 'src/common/utils/sort.util';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { ArenaFilterDto } from './dto/arena-filter.dto';
import { CreateArenaDto } from './dto/create-arena.dto';
import { UpdateArenaDto } from './dto/update-arena.dto';
import { ArenaExtra } from './entities/arena-extra.entity';
import { Arena } from './entities/arena.entity';

@Injectable()
export class ArenasService {
  constructor(
    @InjectRepository(Arena)
    private readonly arenaRepository: Repository<Arena>,
    @InjectRepository(ArenaExtra)
    private readonly extraRepository: Repository<ArenaExtra>,

    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createArenaDto: CreateArenaDto, files?: Express.Multer.File[]) {
    const { categoryId, ...arenaData } = createArenaDto;
    console.log('sssss');

    const images =
      files?.map((file) => ({
        path: `/uploads/arenas/${file.filename}`,
      })) ?? [];
    console.log(images);

    const arena = this.arenaRepository.create({
      ...arenaData,
      images,
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
      .leftJoinAndSelect('arenas.category', 'category');

    // Apply filters dynamically
    applyFilters(query, filters, 'arenas');

    // Apply sorting dynamically
    if (orderBy) {
      applySorting(query, { [orderBy]: direction }, 'arenas');
    }

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

  async remove(id: string) {
    return await this.arenaRepository.delete(id);
  }
}
