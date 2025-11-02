import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Arena } from './arena.entity';
export declare class ArenaSlot {
    id: string;
    date: string;
    hour: number;
    arena: Arena;
    reservation: Reservation;
}
