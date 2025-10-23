import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArenaDto } from './dto/create-arena.dto';
import { UpdateArenaDto } from './dto/update-arena.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Arena } from './entities/arena.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ArenasService {
  constructor(
    @InjectRepository(Arena)
    private readonly arenaRepository: Repository<Arena>,

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

  async findAll() {
    return await this.arenaRepository.find();
  }

  async findOne(id: number) {
    if (!id) return null;
    return await this.arenaRepository.findOneBy({ id });
  }

  async update(id: number, updateArenaDto: UpdateArenaDto) {
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

  async remove(id: number) {
    return await this.arenaRepository.delete(id);
  }
}
