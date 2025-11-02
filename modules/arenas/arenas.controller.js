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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArenasController = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const id_param_dto_1 = require("../../common/dtos/id-param.dto");
const pagination_dto_1 = require("../../common/dtos/pagination.dto");
const sort_dto_1 = require("../../common/dtos/sort.dto");
const serialize_interceptor_1 = require("../../common/interceptors/serialize.interceptor");
const userRole_interface_1 = require("../users/interfaces/userRole.interface");
const arenas_service_1 = require("./arenas.service");
const arena_extra_dto_1 = require("./dto/arena-extra/arena-extra.dto");
const arena_details_dto_1 = require("./dto/arena/arena-details.dto");
const arena_filter_dto_1 = require("./dto/arena/arena-filter.dto");
const arena_summary_dto_1 = require("./dto/arena/arena-summary.dto");
const create_arena_dto_1 = require("./dto/arena/create-arena.dto");
const update_arena_status_dto_1 = require("./dto/arena/update-arena-status.dto");
const update_arena_dto_1 = require("./dto/arena/update-arena.dto");
const platform_express_1 = require("@nestjs/platform-express");
let ArenasController = class ArenasController {
    arenasService;
    constructor(arenasService) {
        this.arenasService = arenasService;
    }
    create(createArenaDto, files) {
        return this.arenasService.create(createArenaDto, files);
    }
    findAll(paginationDto, filters, sort) {
        return this.arenasService.findAll(paginationDto, filters, sort);
    }
    findRequests(paginationDto) {
        return this.arenasService.findRequests(paginationDto);
    }
    findOne(id) {
        return this.arenasService.findOne(id);
    }
    getActiveExtras(id) {
        return this.arenasService.getActiveExtras(id);
    }
    update(id, updateArenaDto) {
        return this.arenasService.update(id, updateArenaDto);
    }
    updateStatus({ id }, dto) {
        return this.arenasService.approve(id, dto.status);
    }
    remove(id) {
        return this.arenasService.remove(id);
    }
};
exports.ArenasController = ArenasController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 },
    ], {
        storage: (0, multer_1.memoryStorage)(),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\/(jpeg|png|jpg|gif|webp)$/)) {
                return cb(new common_1.BadRequestException(`Unsupported file type ${file.originalname}. Only image files are allowed.`), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 50 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_arena_dto_1.CreateArenaDto, Object]),
    __metadata("design:returntype", void 0)
], ArenasController.prototype, "create", null);
__decorate([
    (0, serialize_interceptor_1.Serialize)(arena_summary_dto_1.ArenaSummaryDto),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto,
        arena_filter_dto_1.ArenaFilterDto,
        sort_dto_1.SortDto]),
    __metadata("design:returntype", void 0)
], ArenasController.prototype, "findAll", null);
__decorate([
    (0, serialize_interceptor_1.Serialize)(arena_summary_dto_1.ArenaSummaryDto),
    (0, roles_decorator_1.Roles)(userRole_interface_1.UserRole.ADMIN),
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], ArenasController.prototype, "findRequests", null);
__decorate([
    (0, serialize_interceptor_1.Serialize)(arena_details_dto_1.ArenaDetailsDto),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ArenasController.prototype, "findOne", null);
__decorate([
    (0, serialize_interceptor_1.Serialize)(arena_extra_dto_1.ArenaExtraDto),
    (0, common_1.Get)(':id/extras'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ArenasController.prototype, "getActiveExtras", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_arena_dto_1.UpdateArenaDto]),
    __metadata("design:returntype", void 0)
], ArenasController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(userRole_interface_1.UserRole.ADMIN),
    (0, common_1.Patch)(':id/:status'),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [id_param_dto_1.IdParamDto, update_arena_status_dto_1.UpdateArenaStatusDto]),
    __metadata("design:returntype", void 0)
], ArenasController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ArenasController.prototype, "remove", null);
exports.ArenasController = ArenasController = __decorate([
    (0, common_1.Controller)('arenas'),
    __metadata("design:paramtypes", [arenas_service_1.ArenasService])
], ArenasController);
//# sourceMappingURL=arenas.controller.js.map