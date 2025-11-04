import { isEnum } from 'class-validator';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Dynamically applies filters to a query builder.
 */
export function applyFilters<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  filters: Record<string, any>,
  alias?: string,
): SelectQueryBuilder<T> {
  Object.entries(filters).forEach(([key, value], index) => {
    if (value === undefined || value === null || value === '') return;

    const paramName = `${key}_${index}`;
    const column = alias ? `${alias}.${key}` : key;

    const isUuid =
      typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      );

    if (typeof value === 'string' && !isUuid && !isEnum) {
      // for text-based search
      query.andWhere(`${column} ILIKE :${paramName}`, {
        [paramName]: `%${value}%`,
      });
    } else {
      // for exact match (numbers, booleans, uuids)
      query.andWhere(`${column} = :${paramName}`, { [paramName]: value });
    }
  });

  return query;
}
