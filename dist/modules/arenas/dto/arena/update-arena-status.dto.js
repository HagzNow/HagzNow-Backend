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
exports.UpdateArenaStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const arena_status_interface_1 = require("../../interfaces/arena-status.interface");
class UpdateArenaStatusDto {
    status;
}
exports.UpdateArenaStatusDto = UpdateArenaStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: [arena_status_interface_1.ArenaStatus.ACTIVE, arena_status_interface_1.ArenaStatus.DISABLE] }),
    (0, class_validator_1.IsEnum)(arena_status_interface_1.ArenaStatus, { message: 'Status must be either active or disabled' }),
    __metadata("design:type", String)
], UpdateArenaStatusDto.prototype, "status", void 0);
//# sourceMappingURL=update-arena-status.dto.js.map