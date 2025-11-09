import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Apply exact filters (equality) with optional alias
 */
export function applyExactFilters<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  filters: Record<string, any>,
  alias: string,
): SelectQueryBuilder<T> {
  Object.entries(filters).forEach(([key, value], index) => {
    if (value === undefined || value === null || value === '') return;

    const paramName = `${key}_${index}`;
    const column = alias ? `${alias}.${key}` : key;

    query.andWhere(`${column} = :${paramName}`, { [paramName]: value });
  });

  return query;
}

/**
 * Apply ILIKE (string search) filters with optional alias
 */
export function applyILikeFilters<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  filters: Record<string, string>,
  alias: string,
): SelectQueryBuilder<T> {
  Object.entries(filters).forEach(([key, value], index) => {
    if (!value) return;

    const paramName = `${key}_${index}`;
    const column = alias ? `${alias}.${key}` : key;

    query.andWhere(`${column} ILIKE :${paramName}`, {
      [paramName]: `%${value}%`,
    });
  });

  return query;
}

/**
 * Apply range filters (min/max) with optional alias
 */
export function applyRangeFilters<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  ranges: Record<string, { min?: number; max?: number }>,
  alias: string,
): SelectQueryBuilder<T> {
  Object.entries(ranges).forEach(([key, range], index) => {
    const column = alias ? `${alias}.${key}` : key;

    if (range.min !== undefined) {
      query.andWhere(`${column} >= :${key}_min_${index}`, {
        [`${key}_min_${index}`]: range.min,
      });
    }
    if (range.max !== undefined) {
      query.andWhere(`${column} <= :${key}_max_${index}`, {
        [`${key}_max_${index}`]: range.max,
      });
    }
  });

  return query;
}
