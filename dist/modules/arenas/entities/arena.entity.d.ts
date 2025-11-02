import { Category } from 'src/modules/categories/entities/category.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { ArenaStatus } from '../interfaces/arena-status.interface';
import { ArenaExtra } from './arena-extra.entity';
import { ArenaImage } from './arena-image.entity';
import { ArenaLocation } from './arena-location.entity';
import { ArenaSlot } from './arena-slot.entity';
export declare class Arena {
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
    category: Category;
    images: ArenaImage[];
    location: ArenaLocation;
    status: ArenaStatus;
    extras: ArenaExtra[];
    slots: ArenaSlot[];
    reservations: Reservation[];
    getDepositAmount(totalPrice: number): number;
}
