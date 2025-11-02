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
exports.Reservation = void 0;
const class_transformer_1 = require("class-transformer");
const arena_extra_entity_1 = require("../../arenas/entities/arena-extra.entity");
const arena_slot_entity_1 = require("../../arenas/entities/arena-slot.entity");
const arena_entity_1 = require("../../arenas/entities/arena.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const payment_methods_interface_1 = require("../interfaces/payment-methods.interface");
const reservation_status_interface_1 = require("../interfaces/reservation-status.interface");
let Reservation = class Reservation {
    id;
    dateOfReservation;
    createdAt;
    arena;
    paymentMethod;
    status;
    get totalHours() {
        return this.slots?.length ?? 0;
    }
    playTotalAmount;
    extrasTotalAmount;
    totalAmount;
    slots;
    extras;
    user;
};
exports.Reservation = Reservation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Reservation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Reservation.prototype, "dateOfReservation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Reservation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => arena_entity_1.Arena, (arena) => arena.reservations, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", arena_entity_1.Arena)
], Reservation.prototype, "arena", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: payment_methods_interface_1.PaymentMethod, default: payment_methods_interface_1.PaymentMethod.WALLET }),
    __metadata("design:type", String)
], Reservation.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: reservation_status_interface_1.ReservationStatus,
        default: reservation_status_interface_1.ReservationStatus.HOLD,
    }),
    __metadata("design:type", String)
], Reservation.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], Reservation.prototype, "totalHours", null);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal' }),
    __metadata("design:type", Number)
], Reservation.prototype, "playTotalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal' }),
    __metadata("design:type", Number)
], Reservation.prototype, "extrasTotalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Reservation.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => arena_slot_entity_1.ArenaSlot, (slot) => slot.reservation, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], Reservation.prototype, "slots", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => arena_extra_entity_1.ArenaExtra, (extra) => extra.reservations, {
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinTable)({
        name: 'reservation_extras',
        joinColumn: { name: 'reservation_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'extra_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Reservation.prototype, "extras", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.reservations, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", user_entity_1.User)
], Reservation.prototype, "user", void 0);
exports.Reservation = Reservation = __decorate([
    (0, typeorm_1.Entity)('reservations')
], Reservation);
//# sourceMappingURL=reservation.entity.js.map