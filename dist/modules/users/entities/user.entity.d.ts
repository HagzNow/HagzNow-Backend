import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Wallet } from 'src/modules/wallets/entities/wallet.entity';
import { UserRole } from '../interfaces/userRole.interface';
import { UserStatus } from '../interfaces/userStatus.interface';
export declare class User {
    id: string;
    fName: string;
    lName: string;
    email: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    password: string;
    createdAt: Date;
    wallet: Wallet;
    reservations: Reservation[];
    updatedAt: Date;
    hashingPassword(): Promise<void>;
}
