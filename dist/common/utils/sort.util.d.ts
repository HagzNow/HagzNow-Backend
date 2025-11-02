import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
export declare function applySorting<T extends ObjectLiteral>(query: SelectQueryBuilder<T>, orderBy: Record<string, 'ASC' | 'DESC'>, alias?: string): SelectQueryBuilder<T>;
