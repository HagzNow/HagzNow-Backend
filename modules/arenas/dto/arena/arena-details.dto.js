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
exports.ArenaDetailsDto = void 0;
const class_transformer_1 = require("class-transformer");
const category_dto_1 = require("../../../categories/dto/category.dto");
const arena_extra_dto_1 = require("../arena-extra/arena-extra.dto");
const arena_image_dto_1 = require("../arena-image/arena-image.dto");
const arena_location_dto_1 = require("../arena-location/arena-location.dto");
class ArenaDetailsDto {
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
    location;
    images;
    extras;
}
exports.ArenaDetailsDto = ArenaDetailsDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ArenaDetailsDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ArenaDetailsDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ArenaDetailsDto.prototype, "thumbnail", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ArenaDetailsDto.prototype, "minPeriod", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ArenaDetailsDto.prototype, "openingHour", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ArenaDetailsDto.prototype, "closingHour", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ArenaDetailsDto.prototype, "pricePerHour", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ArenaDetailsDto.prototype, "depositPercent", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ArenaDetailsDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ArenaDetailsDto.prototype, "policy", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => category_dto_1.CategoryDto),
    __metadata("design:type", category_dto_1.CategoryDto)
], ArenaDetailsDto.prototype, "category", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => arena_location_dto_1.ArenaLocationDto),
    __metadata("design:type", arena_location_dto_1.ArenaLocationDto)
], ArenaDetailsDto.prototype, "location", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => arena_image_dto_1.ArenaImageDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], ArenaDetailsDto.prototype, "images", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => arena_extra_dto_1.ArenaExtraDto),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], ArenaDetailsDto.prototype, "extras", void 0);
//# sourceMappingURL=arena-details.dto.js.map