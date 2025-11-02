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
exports.CreateArenaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const arena_status_interface_1 = require("../../interfaces/arena-status.interface");
const create_arena_extra_dto_1 = require("../arena-extra/create-arena-extra.dto");
const create_arena_image_dto_1 = require("../arena-image/create-arena-image.dto");
const create_arena_location_dto_1 = require("../arena-location/create-arena-location.dto");
class CreateArenaDto {
    name;
    thumbnail;
    openingHour;
    closingHour;
    pricePerHour;
    depositPercent;
    description;
    policy;
    status;
    categoryId;
    location;
    images;
    extras;
}
exports.CreateArenaDto = CreateArenaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Arena name',
        example: 'Downtown Football Arena',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateArenaDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Thumbnail image URL',
        example: 'https://example.com/image.jpg',
    }),
    (0, swagger_1.ApiProperty)({
        description: 'Thumbnail image (file upload)',
        type: 'string',
        format: 'binary',
    }),
    __metadata("design:type", String)
], CreateArenaDto.prototype, "thumbnail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Opening hour (0–23)',
        example: 8,
        minimum: 0,
        maximum: 23,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(23),
    __metadata("design:type", Number)
], CreateArenaDto.prototype, "openingHour", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Closing hour (0–23)',
        example: 22,
        minimum: 0,
        maximum: 23,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(23),
    __metadata("design:type", Number)
], CreateArenaDto.prototype, "closingHour", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price per hour', example: 150, minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateArenaDto.prototype, "pricePerHour", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Deposit amount as a percentage of total price',
        example: 20,
        minimum: 0,
        maximum: 100,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateArenaDto.prototype, "depositPercent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Arena description',
        example: 'Spacious field with night lighting',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateArenaDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Arena policy',
        example: 'No cancellations within 24 hours of booking.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateArenaDto.prototype, "policy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: arena_status_interface_1.ArenaStatus,
        description: 'Current status of the arena',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(arena_status_interface_1.ArenaStatus),
    __metadata("design:type", String)
], CreateArenaDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID', example: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateArenaDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: () => create_arena_location_dto_1.CreateArenaLocationDto,
        description: 'Arena location details',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => create_arena_location_dto_1.CreateArenaLocationDto),
    __metadata("design:type", create_arena_location_dto_1.CreateArenaLocationDto)
], CreateArenaDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional images for the arena (multiple file uploads)',
        type: [create_arena_image_dto_1.CreateArenaImageDto],
        items: { type: 'string', format: 'binary' },
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_arena_image_dto_1.CreateArenaImageDto),
    __metadata("design:type", Array)
], CreateArenaDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [create_arena_extra_dto_1.CreateArenaExtraDto],
        description: 'List of arena extras',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_arena_extra_dto_1.CreateArenaExtraDto),
    __metadata("design:type", Array)
], CreateArenaDto.prototype, "extras", void 0);
//# sourceMappingURL=create-arena.dto.js.map