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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArenaExtra = void 0;
const reservation_entity_1 = require("../../reservations/entities/reservation.entity");
const typeorm_1 = require("typeorm");
const arena_entity_1 = require("./arena.entity");
let ArenaExtra = class ArenaExtra {
    id;
    name;
    price;
    isActive;
    arena;
    reservations;
};
exports.ArenaExtra = ArenaExtra;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ArenaExtra.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], ArenaExtra.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal' }),
    __metadata("design:type", Number)
], ArenaExtra.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ArenaExtra.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => arena_entity_1.Arena, (arena) => arena.extras, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", arena_entity_1.Arena)
], ArenaExtra.prototype, "arena", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => reservation_entity_1.Reservation, (reservation) => reservation.extras, {
        onDelete: 'SET NULL',
    }),
    __metadata("design:type", Array)
], ArenaExtra.prototype, "reservations", void 0);
exports.ArenaExtra = ArenaExtra = __decorate([
    (0, typeorm_1.Entity)('arenas_extras')
], ArenaExtra);
//# sourceMappingURL=arena-extra.entity.js.map