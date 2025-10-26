// src/common/utils/paginate.ts
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dtos/pagination.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

export async function paginate<T extends ObjectLiteral>(
  repoOrQuery: Repository<T> | SelectQueryBuilder<T>,
  paginationDto: PaginationDto,
): Promise<PaginatedResult<T>> {
  const { page, limit } = paginationDto;
  const skip = (page - 1) * limit;

  let data: T[] = [];
  let total = 0;

  // handle both repository and query builder
  if (repoOrQuery instanceof Repository) {
    [data, total] = await repoOrQuery.findAndCount({
      skip,
      take: limit,
    });
  } else {
    [data, total] = await repoOrQuery.skip(skip).take(limit).getManyAndCount();
  }

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
