import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from './entities/wallet.entity';
export declare class WalletsService {
    private walletRepository;
    constructor(walletRepository: Repository<Wallet>);
    create(user: User): Promise<Wallet>;
    findOne(id: string): string;
    update(userId: string, balance: number): string;
}
