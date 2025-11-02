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
exports.ArenaSummaryDto = void 0;
const class_transformer_1 = require("class-transformer");
class ArenaSummaryDto {
    id;
    name;
    pricePerHour;
    categoryName;
    thumbnail;
    locationSummary;
}
exports.ArenaSummaryDto = ArenaSummaryDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ArenaSummaryDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ArenaSummaryDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ArenaSummaryDto.prototype, "pricePerHour", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => obj.category.name),
    __metadata("design:type", String)
], ArenaSummaryDto.prototype, "categoryName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ArenaSummaryDto.prototype, "thumbnail", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => {
        const city = obj.location?.city || '';
        const governorate = obj.location?.governorate || '';
        return [city, governorate].filter(Boolean).join(', ');
    }),
    __metadata("design:type", String)
], ArenaSummaryDto.prototype, "locationSummary", void 0);
//# sourceMappingURL=arena-summary.dto.js.map