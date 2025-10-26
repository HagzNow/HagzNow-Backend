import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Dynamically applies sorting to a query builder.
 */
export function applySorting<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  orderBy: Record<string, 'ASC' | 'DESC'>,
  alias?: string,
): SelectQueryBuilder<T> {
  Object.entries(orderBy).forEach(([key, direction]) => {
    const column = alias ? `${alias}.${key}` : key;
    query.addOrderBy(column, direction);
  });

  return query;
}
