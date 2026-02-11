import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { DeleteResult, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const newCategory = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(newCategory);
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(id: string) {
    if (!id) return null;
    return await this.categoryRepository.findOneBy({ id });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return await this.categoryRepository.update(id, updateCategoryDto);
  }

  async remove(id: string): Promise<DeleteResult | never> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['arenas'],
    });

    if (!category) {
      return ApiResponseUtil.throwError(
        'errors.category.not_found',
        'CATEGORY_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    if (category.arenas.length) {
      return ApiResponseUtil.throwError(
        'errors.category.delete_conflict',
        'CATEGORY_DELETE_CONFLICT',
        HttpStatus.CONFLICT,
      );
    }
    return await this.categoryRepository.delete(id);
  }
}
