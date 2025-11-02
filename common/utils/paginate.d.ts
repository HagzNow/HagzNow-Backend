import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dtos/pagination.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
export declare function paginate<T extends ObjectLiteral>(repoOrQuery: Repository<T> | SelectQueryBuilder<T>, paginationDto: PaginationDto): Promise<PaginatedResult<T>>;
