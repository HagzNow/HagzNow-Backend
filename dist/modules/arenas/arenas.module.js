"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArenasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const categories_module_1 = require("../categories/categories.module");
const arena_slots_controller_1 = require("./arena-slots.controller");
const arena_slots_service_1 = require("./arena-slots.service");
const arenas_controller_1 = require("./arenas.controller");
const arenas_service_1 = require("./arenas.service");
const arena_extra_entity_1 = require("./entities/arena-extra.entity");
const arena_image_entity_1 = require("./entities/arena-image.entity");
const arena_location_entity_1 = require("./entities/arena-location.entity");
const arena_slot_entity_1 = require("./entities/arena-slot.entity");
const arena_entity_1 = require("./entities/arena.entity");
let ArenasModule = class ArenasModule {
};
exports.ArenasModule = ArenasModule;
exports.ArenasModule = ArenasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                arena_entity_1.Arena,
                arena_location_entity_1.ArenaLocation,
                arena_image_entity_1.ArenaImage,
                arena_extra_entity_1.ArenaExtra,
                arena_slot_entity_1.ArenaSlot,
            ]),
            categories_module_1.CategoriesModule,
        ],
        controllers: [arenas_controller_1.ArenasController, arena_slots_controller_1.ArenaSlotsController],
        providers: [arenas_service_1.ArenasService, arena_slots_service_1.ArenaSlotsService],
    })
], ArenasModule);
//# sourceMappingURL=arenas.module.js.map