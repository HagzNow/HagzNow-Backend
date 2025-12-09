import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { TransactionStage } from './interfaces/transaction-stage.interface';
import { TransactionType } from './interfaces/transaction-type.interface';
import { WalletTransactionService } from './wallet-transaction.service';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => WalletTransactionService))
    private readonly walletTransactionService: WalletTransactionService,
  ) {}
  async create(user: User) {
    const newWallet = this.walletRepository.create({ user, balance: 0 });
    return await this.walletRepository.save(newWallet);
  }

  async hasEnoughBalance(userId: string, amount: number) {
    const wallet = await this.findOneByUserId(userId);
    if (!wallet) return false;
    console.log('wallet.balance', wallet.balance, 'amount', amount);
    return wallet.balance >= amount;
  }

  async lockAmount(userId: string, amount: number, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Wallet)
      : this.walletRepository;

    const wallet = await repo.findOne({ where: { user: { id: userId } } });
    if (!wallet) return false;

    wallet.heldAmount = Number(wallet.heldAmount) + amount;
    await repo.save(wallet);
    return true;
  }

  async getBalanceByUser(user: User) {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (!wallet) {
      // this will only happen in case of teh event listener didn't get executed
      await this.create(user);
      return { availableBalance: 0, heldAmount: 0 };
    }
    return { availableBalance: wallet.balance, heldAmount: wallet.heldAmount };
  }

  findOne(id: string) {
    return `This action returns a #${id} wallet`;
  }

  findOneByUserId(userId: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Wallet)
      : this.walletRepository;
    return repo.findOne({ where: { user: { id: userId } } });
  }

  async deduceAmount(amount: number, user: User, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Wallet)
      : this.walletRepository;
    const wallet = await this.findOneByUserId(user.id, manager);
    if (!wallet) {
      return ApiResponseUtil.throwError(
        'Wallet not found for this user',
        'WALLET_NOT_FOUND',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (wallet.balance < amount) {
      return ApiResponseUtil.throwError(
        'Insufficient balance',
        'INSUFFICIENT_BALANCE',
        HttpStatus.BAD_REQUEST,
      );
    }
    wallet.balance = Number(wallet.balance) - amount;
    await repo.save(wallet);
    return { message: 'Withdrawal successful', balance: wallet.balance };
  }

  async processWithdrawal(amount: number, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate amount
      if (!amount || amount <= 0) {
        throw ApiResponseUtil.throwError(
          'Amount must be greater than zero',
          'INVALID_AMOUNT',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Ensure balance is enough
      const hasEnough = await this.hasEnoughBalance(user.id, amount);
      if (!hasEnough) {
        throw ApiResponseUtil.throwError(
          'Insufficient balance',
          'INSUFFICIENT_BALANCE',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Deduct amount from wallet
      await this.deduceAmount(amount, user, queryRunner.manager);

      // 4. Create local INSTANT wallet transaction
      const newWithdrawTx = await this.walletTransactionService.create(
        {
          amount,
          stage: TransactionStage.INSTANT,
          type: TransactionType.WITHDRAWAL,
          referenceId: 'withdraw_' + Date.now(),
        },
        user,
        queryRunner.manager,
      );
      // 5. Commit transaction
      await queryRunner.commitTransaction();
      return newWithdrawTx;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  update(userId: string, balance: number) {
    return `This action updates a #${userId} wallet`;
  }
}
