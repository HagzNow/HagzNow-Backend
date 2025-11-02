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
exports.UpdateArenaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const update_arena_extra_dto_1 = require("../arena-extra/update-arena-extra.dto");
const update_arena_image_dto_1 = require("../arena-image/update-arena-image.dto");
const update_arena_location_dto_1 = require("../arena-location/update-arena-location.dto");
const create_arena_dto_1 = require("./create-arena.dto");
class UpdateArenaDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_arena_dto_1.CreateArenaDto, ['location', 'images', 'extras'])) {
    location;
    images;
    extras;
}
exports.UpdateArenaDto = UpdateArenaDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => update_arena_location_dto_1.UpdateArenaLocationDto),
    __metadata("design:type", update_arena_location_dto_1.UpdateArenaLocationDto)
], UpdateArenaDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => update_arena_image_dto_1.UpdateArenaImageDto),
    __metadata("design:type", Array)
], UpdateArenaDto.prototype, "images", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => update_arena_extra_dto_1.UpdateArenaExtraDto),
    __metadata("design:type", Array)
], UpdateArenaDto.prototype, "extras", void 0);
//# sourceMappingURL=update-arena.dto.js.map