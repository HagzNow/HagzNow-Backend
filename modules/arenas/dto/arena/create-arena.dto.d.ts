import { ArenaStatus } from '../../interfaces/arena-status.interface';
import { CreateArenaExtraDto } from '../arena-extra/create-arena-extra.dto';
import { CreateArenaImageDto } from '../arena-image/create-arena-image.dto';
import { CreateArenaLocationDto } from '../arena-location/create-arena-location.dto';
export declare class CreateArenaDto {
    name: string;
    thumbnail: string;
    openingHour: number;
    closingHour: number;
    pricePerHour: number;
    depositPercent: number;
    description?: string;
    policy?: string;
    status?: ArenaStatus;
    categoryId?: string;
    location?: CreateArenaLocationDto;
    images?: CreateArenaImageDto[];
    extras?: CreateArenaExtraDto[];
}
