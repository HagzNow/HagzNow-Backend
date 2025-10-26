import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { WalletController } from './wallets.controller';
import { WalletsListener } from './wallets.listener';
import { WalletsService } from './wallets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction])],

  controllers: [WalletController],
  providers: [WalletsService, WalletsListener],
})
export class WalletModule {}
