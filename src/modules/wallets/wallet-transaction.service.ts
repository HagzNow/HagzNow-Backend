import { Injectable, Body, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { WalletsService } from './wallets.service';
import { TransactionStage } from './interfaces/transaction-stage.interface';

@Injectable()
export class WalletTransactionService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,
    private walletService: WalletsService,
  ) {}
  async create(
    createwqalletTransactionDto: CreateWalletTransactionDto,
    user: User,
  ) {
    const wallet = await this.walletService.findOneByUserId(user.id);
    if (!wallet) {
      throw new BadRequestException('Wallet not found for this user');
    }

    const newWalletTransaction = this.walletTransactionRepository.create({
      wallet,
      ...createwqalletTransactionDto,
    });
    return await this.walletTransactionRepository.save(newWalletTransaction);
  }

  async findOne(id: string) {
    return await this.walletTransactionRepository.findBy({ id });
  }

  async findOneByReferenceId(referenceId: string) {
    return await this.walletTransactionRepository.findOne({
      where: { referenceId },
    });
  }

  update(id: string) {
    return `This action updates a #${id} wallet`;
  }
  // async updateByRefernceId(referenceId: string, stage: TransactionStage) {
  //   return await this.walletTransactionRepository.update(
  //     { referenceId },
  //     { stage },
  //   );
  // }

  async processCompleteTransaction(amount: number, referenceId: string) {
    return await this.dataSource.transaction(async (manager) => {
      // ✅ Step 1: Find transaction by referenceId
      const transaction = await manager
        .getRepository(WalletTransaction)
        .findOne({ where: { referenceId } });

      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      if (transaction.stage !== TransactionStage.PENDING) {
        throw new BadRequestException(
          'Funds already added for this transaction',
        );
      }

      // ✅ Step 2: Update transaction stage
      transaction.stage = TransactionStage.SETTLED;
      await manager.getRepository(WalletTransaction).save(transaction);

      // ✅ Step 3: Get wallet for this user
      const wallet = await manager
        .getRepository(Wallet)
        .findOne({ where: { id: transaction.wallet.id } });

      if (!wallet) {
        throw new BadRequestException('Wallet not found for this user');
      }

      // ✅ Step 4: Update wallet balance
      wallet.balance += amount;
      await manager.getRepository(Wallet).save(wallet);

      // ✅ Step 5: Optionally return updated wallet or transaction
      return { wallet, transaction };
    });
  }
}
