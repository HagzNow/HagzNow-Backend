import { ArenaExtra } from 'src/modules/arenas/entities/arena-extra.entity';
import { ArenaSlot } from 'src/modules/arenas/entities/arena-slot.entity';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { PaymentMethod } from '../interfaces/payment-methods.interface';
import { ReservationStatus } from '../interfaces/reservation-status.interface';
export declare class Reservation {
    id: string;
    dateOfReservation: string;
    createdAt: Date;
    arena: Arena;
    paymentMethod: PaymentMethod;
    status: ReservationStatus;
    get totalHours(): number;
    playTotalAmount: number;
    extrasTotalAmount: number;
    totalAmount: number;
    slots: ArenaSlot[];
    extras: ArenaExtra[];
    user: User;
}
