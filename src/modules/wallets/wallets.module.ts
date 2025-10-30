import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { PaymobWebhookController } from './paymob.controller';
import { PaymobService } from './paymob.service';
import { WalletController } from './wallets.controller';
import { WalletsListener } from './wallets.listener';
import { WalletsService } from './wallets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction])],

  controllers: [WalletController, PaymobWebhookController],
  providers: [WalletsService, WalletsListener, PaymobService],
})
export class WalletModule {}
