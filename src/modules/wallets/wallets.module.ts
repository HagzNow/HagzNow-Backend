import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { PaymobWebhookController } from './paymob.controller';
import { PaymobService } from './paymob.service';
import { WalletTransactionController } from './wallet-transaction.controller';
import { WalletTransactionService } from './wallet-transaction.service';
import { WalletController } from './wallets.controller';
import { WalletsListener } from './wallets.listener';
import { WalletsService } from './wallets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction]), AuthModule],

  controllers: [
    WalletController,
    PaymobWebhookController,
    WalletTransactionController,
  ],
  providers: [
    WalletsService,
    WalletsListener,
    PaymobService,
    WalletTransactionService,
  ],
  exports: [WalletsService, WalletTransactionService],
})
export class WalletModule {}
