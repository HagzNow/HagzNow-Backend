import { User } from 'src/modules/users/entities/user.entity';
import { WalletTransaction } from './wallet-transaction.entity';
export declare class Wallet {
    id: string;
    balance: number;
    currency: string;
    user: User;
    transactions: WalletTransaction[];
}
