import { TransactionStage } from '../interfaces/transaction-stage.interface';
import { TransactionType } from '../interfaces/transaction-type.interface';
import { Wallet } from './wallet.entity';
export declare class WalletTransaction {
    id: string;
    amount: number;
    type: TransactionType;
    stage: TransactionStage;
    createdAt: Date;
    referenceId?: string;
    wallet: Wallet;
}
