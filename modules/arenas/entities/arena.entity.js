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
exports.Arena = void 0;
const category_entity_1 = require("../../categories/entities/category.entity");
const reservation_entity_1 = require("../../reservations/entities/reservation.entity");
const typeorm_1 = require("typeorm");
const arena_status_interface_1 = require("../interfaces/arena-status.interface");
const arena_extra_entity_1 = require("./arena-extra.entity");
const arena_image_entity_1 = require("./arena-image.entity");
const arena_location_entity_1 = require("./arena-location.entity");
const arena_slot_entity_1 = require("./arena-slot.entity");
let Arena = class Arena {
    id;
    name;
    thumbnail;
    minPeriod;
    openingHour;
    closingHour;
    pricePerHour;
    depositPercent;
    description;
    policy;
    category;
    images;
    location;
    status;
    extras;
    slots;
    reservations;
    getDepositAmount(totalPrice) {
        return (totalPrice * this.depositPercent) / 100;
    }
};
exports.Arena = Arena;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Arena.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 244 }),
    __metadata("design:type", String)
], Arena.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Arena.prototype, "thumbnail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 60 }),
    __metadata("design:type", Number)
], Arena.prototype, "minPeriod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true }),
    __metadata("design:type", Number)
], Arena.prototype, "openingHour", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true }),
    __metadata("design:type", Number)
], Arena.prototype, "closingHour", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal' }),
    __metadata("design:type", Number)
], Arena.prototype, "pricePerHour", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', default: 20 }),
    __metadata("design:type", Number)
], Arena.prototype, "depositPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Arena.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Arena.prototype, "policy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.arenas, {
        onDelete: 'RESTRICT',
        eager: true,
    }),
    __metadata("design:type", category_entity_1.Category)
], Arena.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => arena_image_entity_1.ArenaImage, (image) => image.arena, {
        cascade: true,
        onDelete: 'CASCADE',
        eager: true,
    }),
    __metadata("design:type", Array)
], Arena.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => arena_location_entity_1.ArenaLocation, (location) => location.arena, {
        cascade: true,
        onDelete: 'CASCADE',
        eager: true,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", arena_location_entity_1.ArenaLocation)
], Arena.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: arena_status_interface_1.ArenaStatus, default: arena_status_interface_1.ArenaStatus.PENDING }),
    __metadata("design:type", String)
], Arena.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => arena_extra_entity_1.ArenaExtra, (extra) => extra.arena, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Arena.prototype, "extras", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => arena_slot_entity_1.ArenaSlot, (slot) => slot.arena),
    __metadata("design:type", Array)
], Arena.prototype, "slots", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reservation_entity_1.Reservation, (reservation) => reservation.arena),
    __metadata("design:type", Array)
], Arena.prototype, "reservations", void 0);
exports.Arena = Arena = __decorate([
    (0, typeorm_1.Entity)('arenas')
], Arena);
//# sourceMappingURL=arena.entity.js.map