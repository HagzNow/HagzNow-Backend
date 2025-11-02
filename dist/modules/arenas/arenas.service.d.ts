import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SortDto } from 'src/common/dtos/sort.dto';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { ArenaFilterDto } from './dto/arena/arena-filter.dto';
import { CreateArenaDto } from './dto/arena/create-arena.dto';
import { UpdateArenaDto } from './dto/arena/update-arena.dto';
import { ArenaExtra } from './entities/arena-extra.entity';
import { Arena } from './entities/arena.entity';
import { ArenaStatus } from './interfaces/arena-status.interface';
export declare class ArenasService {
    private readonly arenaRepository;
    private readonly extraRepository;
    private readonly categoriesService;
    constructor(arenaRepository: Repository<Arena>, extraRepository: Repository<ArenaExtra>, categoriesService: CategoriesService);
    create(createArenaDto: CreateArenaDto, files?: {
        thumbnail?: Express.Multer.File[];
        images?: Express.Multer.File[];
    }): Promise<Arena>;
    findAll(paginationDto: PaginationDto, filters: ArenaFilterDto, sort: SortDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<Arena>>;
    findRequests(paginationDto: PaginationDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<Arena>>;
    findOne(id: string): Promise<Arena | null>;
    getActiveExtras(arenaId: string): Promise<ArenaExtra[]>;
    update(id: string, updateArenaDto: UpdateArenaDto): Promise<Arena>;
    approve(id: string, status: ArenaStatus): Promise<Arena>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
