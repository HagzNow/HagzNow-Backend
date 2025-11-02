import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
export declare function applyFilters<T extends ObjectLiteral>(query: SelectQueryBuilder<T>, filters: Record<string, any>, alias?: string): SelectQueryBuilder<T>;
