import { CategoryDto } from 'src/modules/categories/dto/category.dto';
import { ArenaExtraDto } from '../arena-extra/arena-extra.dto';
import { ArenaImageDto } from '../arena-image/arena-image.dto';
import { ArenaLocationDto } from '../arena-location/arena-location.dto';
export declare class ArenaDetailsDto {
    id: string;
    name: string;
    thumbnail: string;
    minPeriod: number;
    openingHour: number;
    closingHour: number;
    pricePerHour: number;
    depositPercent: number;
    description: string;
    policy: string;
    category: CategoryDto;
    location?: ArenaLocationDto;
    images?: ArenaImageDto[];
    extras?: ArenaExtraDto[];
}
