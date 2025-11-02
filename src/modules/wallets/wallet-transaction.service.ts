import { Injectable, Body, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { WalletsService } from './wallets.service';
import { TransactionStage } from './interfaces/transaction-stage.interface';

@Injectable()
export class WalletTransactionService {
  constructor(
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

  update(id: string) {
    return `This action updates a #${id} wallet`;
  }
  async updateByRefernceId(referenceId: string, stage: TransactionStage) {
    return await this.walletTransactionRepository.update(
      { referenceId },
      { stage },
    );
  }
}
