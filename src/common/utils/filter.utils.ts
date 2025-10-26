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

    if (typeof value === 'string') {
      query.andWhere(`${column} ILIKE :${paramName}`, {
        [paramName]: `%${value}%`,
      });
    } else {
      query.andWhere(`${column} = :${paramName}`, { [paramName]: value });
    }
  });

  return query;
}
