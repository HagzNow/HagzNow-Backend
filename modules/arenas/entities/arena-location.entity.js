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
exports.ArenaLocation = void 0;
const typeorm_1 = require("typeorm");
const arena_entity_1 = require("./arena.entity");
let ArenaLocation = class ArenaLocation {
    id;
    lat;
    lng;
    governorate;
    city;
    arena;
};
exports.ArenaLocation = ArenaLocation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ArenaLocation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: false }),
    __metadata("design:type", Number)
], ArenaLocation.prototype, "lat", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: false }),
    __metadata("design:type", Number)
], ArenaLocation.prototype, "lng", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], ArenaLocation.prototype, "governorate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ArenaLocation.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => arena_entity_1.Arena, (arena) => arena.location, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", arena_entity_1.Arena)
], ArenaLocation.prototype, "arena", void 0);
exports.ArenaLocation = ArenaLocation = __decorate([
    (0, typeorm_1.Entity)('arena_locations')
], ArenaLocation);
//# sourceMappingURL=arena-location.entity.js.map