import { User } from 'src/modules/users/entities/user.entity';
import { WalletsService } from './wallets.service';
export declare class WalletsListener {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    handleUserCreated(user: User): void;
}
