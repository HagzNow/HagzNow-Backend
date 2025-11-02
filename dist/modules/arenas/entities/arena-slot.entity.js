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
exports.ArenaSlot = void 0;
const reservation_entity_1 = require("../../reservations/entities/reservation.entity");
const typeorm_1 = require("typeorm");
const arena_entity_1 = require("./arena.entity");
let ArenaSlot = class ArenaSlot {
    id;
    date;
    hour;
    arena;
    reservation;
};
exports.ArenaSlot = ArenaSlot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ArenaSlot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], ArenaSlot.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true }),
    __metadata("design:type", Number)
], ArenaSlot.prototype, "hour", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => arena_entity_1.Arena, (arena) => arena.slots, { onDelete: 'CASCADE' }),
    __metadata("design:type", arena_entity_1.Arena)
], ArenaSlot.prototype, "arena", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reservation_entity_1.Reservation, (reservation) => reservation.slots, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", reservation_entity_1.Reservation)
], ArenaSlot.prototype, "reservation", void 0);
exports.ArenaSlot = ArenaSlot = __decorate([
    (0, typeorm_1.Entity)('arena_slots'),
    (0, typeorm_1.Index)('unique_arena_date_hour', ['arena', 'date', 'hour'], { unique: true })
], ArenaSlot);
//# sourceMappingURL=arena-slot.entity.js.map