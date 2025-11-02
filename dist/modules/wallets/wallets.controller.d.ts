import { PaymobService } from './paymob.service';
import { WalletsService } from './wallets.service';
export declare class WalletController {
    private readonly walletsService;
    private paymobService;
    constructor(walletsService: WalletsService, paymobService: PaymobService);
    findOne(id: string): string;
    addFunds(amount: number, email: string): Promise<{
        paymentUrl: string;
    }>;
}
