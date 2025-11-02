import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Arena } from './arena.entity';
export declare class ArenaExtra {
    id: string;
    name: string;
    price: number;
    isActive: boolean;
    arena: Arena;
    reservations: Reservation[];
}
