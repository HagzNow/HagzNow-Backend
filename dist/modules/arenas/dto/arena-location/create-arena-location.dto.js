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
exports.CreateArenaLocationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateArenaLocationDto {
    lat;
    lng;
    governorate;
    city;
}
exports.CreateArenaLocationDto = CreateArenaLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Latitude coordinate', example: 30.0444 }),
    (0, class_validator_1.IsNumber)({}, { message: 'Latitude must be a number' }),
    __metadata("design:type", Number)
], CreateArenaLocationDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Longitude coordinate', example: 31.2357 }),
    (0, class_validator_1.IsNumber)({}, { message: 'Longitude must be a number' }),
    __metadata("design:type", Number)
], CreateArenaLocationDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Governorate or region name', example: 'Cairo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateArenaLocationDto.prototype, "governorate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'City name', example: 'Nasr City' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateArenaLocationDto.prototype, "city", void 0);
//# sourceMappingURL=create-arena-location.dto.js.map