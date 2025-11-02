"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArenasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const api_response_util_1 = require("../../common/utils/api-response.util");
const filter_utils_1 = require("../../common/utils/filter.utils");
const paginate_1 = require("../../common/utils/paginate");
const sort_util_1 = require("../../common/utils/sort.util");
const typeorm_2 = require("typeorm");
const categories_service_1 = require("../categories/categories.service");
const arena_extra_entity_1 = require("./entities/arena-extra.entity");
const arena_entity_1 = require("./entities/arena.entity");
const arena_status_interface_1 = require("./interfaces/arena-status.interface");
const axios_1 = __importDefault(require("axios"));
const stream_1 = require("stream");
const form_data_1 = __importDefault(require("form-data"));
let ArenasService = class ArenasService {
    arenaRepository;
    extraRepository;
    categoriesService;
    constructor(arenaRepository, extraRepository, categoriesService) {
        this.arenaRepository = arenaRepository;
        this.extraRepository = extraRepository;
        this.categoriesService = categoriesService;
    }
    async create(createArenaDto, files) {
        const { categoryId, ...arenaData } = createArenaDto;
        let thumbnail = '';
        let uploadedImages = [];
        const uploadToSersawy = async (files) => {
            const formData = new form_data_1.default();
            for (const file of files) {
                const stream = stream_1.Readable.from(file.buffer);
                formData.append('images[]', stream, {
                    filename: file.originalname,
                    contentType: file.mimetype,
                });
            }
            const response = await axios_1.default.post('https://api.sersawy.com/images/', formData, {
                headers: formData.getHeaders(),
            });
            if (response.data?.success) {
                return response.data.files.map((f) => ({
                    path: f.url,
                    filename: f.filename,
                    size: f.size,
                    width: f.dimensions?.width,
                    height: f.dimensions?.height,
                }));
            }
            throw new Error('Upload failed: ' + JSON.stringify(response.data));
        };
        try {
            if (files?.thumbnail?.length) {
                const uploaded = await uploadToSersawy(files.thumbnail);
                thumbnail = uploaded[0].path;
            }
            if (files?.images?.length) {
                uploadedImages = await uploadToSersawy(files.images);
            }
        }
        catch (err) {
            console.error('❌ Error uploading to sersawy.com:', err.response?.data || err.message);
            throw err;
        }
        console.log(thumbnail);
        console.log(thumbnail);
        const arena = this.arenaRepository.create({
            ...arenaData,
            thumbnail,
            images: uploadedImages,
        });
        if (categoryId) {
            const category = await this.categoriesService.findOne(categoryId);
            if (!category)
                throw new common_1.NotFoundException(`Category ${categoryId} not found`);
            arena.category = category;
        }
        return await this.arenaRepository.save(arena);
    }
    async findAll(paginationDto, filters, sort) {
        const { orderBy, direction } = sort;
        const query = this.arenaRepository
            .createQueryBuilder('arenas')
            .leftJoinAndSelect('arenas.location', 'location')
            .leftJoinAndSelect('arenas.category', 'category')
            .where('arenas.status = :status', { status: 'active' });
        (0, filter_utils_1.applyFilters)(query, filters, 'arenas');
        if (orderBy) {
            (0, sort_util_1.applySorting)(query, { [orderBy]: direction }, 'arenas');
        }
        return (0, paginate_1.paginate)(query, paginationDto);
    }
    async findRequests(paginationDto) {
        const query = this.arenaRepository
            .createQueryBuilder('arenas')
            .leftJoinAndSelect('arenas.location', 'location')
            .leftJoinAndSelect('arenas.category', 'category');
        return (0, paginate_1.paginate)(query, paginationDto);
    }
    async findOne(id) {
        if (!id)
            return null;
        return await this.arenaRepository.findOneBy({ id });
    }
    async getActiveExtras(arenaId) {
        return this.extraRepository.find({
            where: { arena: { id: arenaId }, isActive: true },
        });
    }
    async update(id, updateArenaDto) {
        const arena = await this.arenaRepository.findOne({
            where: { id },
            relations: ['images', 'location'],
        });
        if (!arena) {
            throw new common_1.NotFoundException('Arena not found');
        }
        this.arenaRepository.merge(arena, updateArenaDto);
        return await this.arenaRepository.save(arena);
    }
    async approve(id, status) {
        const arena = await this.arenaRepository.findOneBy({ id });
        if (!arena) {
            return api_response_util_1.ApiResponseUtil.throwError('ARENA_NOT_FOUND', 'Arena not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (arena.status !== arena_status_interface_1.ArenaStatus.PENDING) {
            return api_response_util_1.ApiResponseUtil.throwError('INVALID_ARENA_STATUS', 'Only pending arenas can be approved', common_1.HttpStatus.BAD_REQUEST);
        }
        arena.status = status;
        return await this.arenaRepository.save(arena);
    }
    async remove(id) {
        return await this.arenaRepository.delete(id);
    }
};
exports.ArenasService = ArenasService;
exports.ArenasService = ArenasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(arena_entity_1.Arena)),
    __param(1, (0, typeorm_1.InjectRepository)(arena_extra_entity_1.ArenaExtra)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        categories_service_1.CategoriesService])
], ArenasService);
//# sourceMappingURL=arenas.service.js.map