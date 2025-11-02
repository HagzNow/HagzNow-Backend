import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { PaymobWebhookController } from './paymob.controller';
import { PaymobService } from './paymob.service';
import { WalletController } from './wallets.controller';
import { WalletsListener } from './wallets.listener';
import { WalletsService } from './wallets.service';
import { AuthModule } from '../auth/auth.module';
import { WalletTransactionService } from './wallet-transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction]), AuthModule],

  controllers: [WalletController, PaymobWebhookController],
  providers: [
    WalletsService,
    WalletsListener,
    PaymobService,
    WalletTransactionService,
  ],
})
export class WalletModule {}
