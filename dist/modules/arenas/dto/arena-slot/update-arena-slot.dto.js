"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateArenaSlotDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_arena_slot_dto_1 = require("./create-arena-slot.dto");
class UpdateArenaSlotDto extends (0, mapped_types_1.PartialType)(create_arena_slot_dto_1.CreateArenaSlotDto) {
}
exports.UpdateArenaSlotDto = UpdateArenaSlotDto;
//# sourceMappingURL=update-arena-slot.dto.js.map