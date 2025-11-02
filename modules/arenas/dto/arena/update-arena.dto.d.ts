import { UpdateArenaExtraDto } from '../arena-extra/update-arena-extra.dto';
import { UpdateArenaImageDto } from '../arena-image/update-arena-image.dto';
import { UpdateArenaLocationDto } from '../arena-location/update-arena-location.dto';
import { CreateArenaDto } from './create-arena.dto';
declare const UpdateArenaDto_base: import("@nestjs/common").Type<Partial<Omit<CreateArenaDto, "images" | "location" | "extras">>>;
export declare class UpdateArenaDto extends UpdateArenaDto_base {
    location?: UpdateArenaLocationDto;
    images?: UpdateArenaImageDto[];
    extras?: UpdateArenaExtraDto[];
}
export {};
