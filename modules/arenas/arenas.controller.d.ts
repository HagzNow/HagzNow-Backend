import { IdParamDto } from 'src/common/dtos/id-param.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SortDto } from 'src/common/dtos/sort.dto';
import { ArenasService } from './arenas.service';
import { ArenaFilterDto } from './dto/arena/arena-filter.dto';
import { CreateArenaDto } from './dto/arena/create-arena.dto';
import { UpdateArenaStatusDto } from './dto/arena/update-arena-status.dto';
import { UpdateArenaDto } from './dto/arena/update-arena.dto';
export declare class ArenasController {
    private readonly arenasService;
    constructor(arenasService: ArenasService);
    create(createArenaDto: CreateArenaDto, files: {
        thumbnail?: Express.Multer.File[];
        images?: Express.Multer.File[];
    }): Promise<import("./entities/arena.entity").Arena>;
    findAll(paginationDto: PaginationDto, filters: ArenaFilterDto, sort: SortDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("./entities/arena.entity").Arena>>;
    findRequests(paginationDto: PaginationDto): Promise<import("../../common/interfaces/paginated-result.interface").PaginatedResult<import("./entities/arena.entity").Arena>>;
    findOne(id: string): Promise<import("./entities/arena.entity").Arena | null>;
    getActiveExtras(id: string): Promise<import("./entities/arena-extra.entity").ArenaExtra[]>;
    update(id: string, updateArenaDto: UpdateArenaDto): Promise<import("./entities/arena.entity").Arena>;
    updateStatus({ id }: IdParamDto, dto: UpdateArenaStatusDto): Promise<import("./entities/arena.entity").Arena>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
