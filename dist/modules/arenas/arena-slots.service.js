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
exports.ArenaSlotsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const api_response_util_1 = require("../../common/utils/api-response.util");
const typeorm_2 = require("typeorm");
const arena_slot_entity_1 = require("./entities/arena-slot.entity");
const arena_entity_1 = require("./entities/arena.entity");
let ArenaSlotsService = class ArenaSlotsService {
    slotRepo;
    arenaRepo;
    constructor(slotRepo, arenaRepo) {
        this.slotRepo = slotRepo;
        this.arenaRepo = arenaRepo;
    }
    async getAvailableSlots(arenaId, date) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        if (formattedDate > date) {
            return api_response_util_1.ApiResponseUtil.throwError('You cannot check available slots for past dates', 'INVALID_DATE', common_1.HttpStatus.BAD_REQUEST);
        }
        const arena = await this.arenaRepo.findOne({ where: { id: arenaId } });
        if (!arena)
            return api_response_util_1.ApiResponseUtil.throwError('Arena not found', 'Arena_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        const bookedSlots = await this.slotRepo.find({
            where: { arena: { id: arenaId }, date },
            select: ['hour'],
        });
        const bookedHours = bookedSlots.map((slot) => slot.hour);
        const allHours = [];
        for (let h = arena.openingHour; h < arena.closingHour; h++) {
            allHours.push(h);
        }
        const availableHours = allHours.filter((h) => !bookedHours.includes(h));
        return {
            arenaId,
            date,
            availableHours,
        };
    }
};
exports.ArenaSlotsService = ArenaSlotsService;
exports.ArenaSlotsService = ArenaSlotsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(arena_slot_entity_1.ArenaSlot)),
    __param(1, (0, typeorm_1.InjectRepository)(arena_entity_1.Arena)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ArenaSlotsService);
//# sourceMappingURL=arena-slots.service.js.map