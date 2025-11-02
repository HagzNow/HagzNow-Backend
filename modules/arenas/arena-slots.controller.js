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
exports.ArenaSlotsController = void 0;
const common_1 = require("@nestjs/common");
const arena_slots_service_1 = require("./arena-slots.service");
const arena_slot_query_dto_1 = require("./dto/arena-slot/arena-slot-query.dto");
const arena_params_dto_1 = require("./dto/arena/arena-params.dto");
let ArenaSlotsController = class ArenaSlotsController {
    slotsService;
    constructor(slotsService) {
        this.slotsService = slotsService;
    }
    async getAvailableSlots(params, query) {
        return this.slotsService.getAvailableSlots(params.arenaId, query.date);
    }
};
exports.ArenaSlotsController = ArenaSlotsController;
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [arena_params_dto_1.ArenaParamsDto,
        arena_slot_query_dto_1.ArenaSlotQueryDto]),
    __metadata("design:returntype", Promise)
], ArenaSlotsController.prototype, "getAvailableSlots", null);
exports.ArenaSlotsController = ArenaSlotsController = __decorate([
    (0, common_1.Controller)('arenas/:arenaId/slots'),
    __metadata("design:paramtypes", [arena_slots_service_1.ArenaSlotsService])
], ArenaSlotsController);
//# sourceMappingURL=arena-slots.controller.js.map