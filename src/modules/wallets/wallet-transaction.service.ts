import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { paginate } from 'src/common/utils/paginate';
import { applySorting } from 'src/common/utils/sort.util';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { TransactionStage } from './interfaces/transaction-stage.interface';
import { TransactionType } from './interfaces/transaction-type.interface';
import { WalletsService } from './wallets.service';

@Injectable()
export class WalletTransactionService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,
    private walletService: WalletsService,
  ) {}
  async create(
    createWalletTransactionDto: CreateWalletTransactionDto,
    user: User,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(WalletTransaction)
      : this.walletTransactionRepository;
    const wallet = await this.walletService.findOneByUserId(user.id, manager);
    if (!wallet) {
      return ApiResponseUtil.throwError(
        'Wallet not found for this user',
        'WALLET_NOT_FOUND',
        400,
      );
    }

    const newWalletTransaction = repo.create({
      wallet,
      ...createWalletTransactionDto,
      user,
    });
    return await repo.save(newWalletTransaction);
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const query = this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId: user.id });

    applySorting(query, { createdAt: 'DESC' }, 'transaction');

    return await paginate(query, paginationDto);
  }

  async findOne(id: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(WalletTransaction)
      : this.walletTransactionRepository;
    const transaction = await repo.findOne({ where: { id } });
    if (!transaction) {
      return ApiResponseUtil.throwError(
        'Associated wallet transaction not found',
        'WALLET_TRANSACTION_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return transaction;
  }

  async findOneByReferenceId(referenceId: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(WalletTransaction)
      : this.walletTransactionRepository;
    const transaction = await repo.findOne({
      where: { referenceId, stage: TransactionStage.HOLD },
    });
    if (!transaction) {
      return ApiResponseUtil.throwError(
        'Associated wallet transaction not found',
        'WALLET_TRANSACTION_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return transaction;
  }
  async findSettledTransactionsByReferenceId(
    referenceId: string,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(WalletTransaction)
      : this.walletTransactionRepository;
    return await repo.findOne({
      where: { referenceId, stage: TransactionStage.SETTLED },
    });
  }

  update(id: string) {
    return `This action updates a #${id} wallet`;
  }
  async updateByReferenceId(referenceId: string, stage: TransactionStage) {
    return await this.walletTransactionRepository.update(
      { referenceId },
      { stage },
    );
  }

  async processCompleteTransaction(amount: number, referenceId: string) {
    return await this.dataSource.transaction(async (manager) => {
      // ✅ Step 1: Find transaction by referenceId
      const transaction = await manager
        .getRepository(WalletTransaction)
        .findOne({ where: { referenceId } });

      if (!transaction) {
        return ApiResponseUtil.throwError(
          'Transaction not found',
          'TRANSACTION_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      if (transaction.stage !== TransactionStage.PENDING) {
        return ApiResponseUtil.throwError(
          'Transaction is not in PENDING stage',
          'INVALID_TRANSACTION_STAGE',
          HttpStatus.CONFLICT,
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
        return ApiResponseUtil.throwError(
          'Wallet not found',
          'WALLET_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      // ✅ Step 4: Update wallet balance
      wallet.balance = Number(wallet.balance) + amount;
      await manager.getRepository(Wallet).save(wallet);

      // ✅ Step 5: Optionally return updated wallet or transaction
      return { wallet, transaction };
    });
  }
  async processFailedTransaction(referenceId: string) {
    return await this.updateByReferenceId(referenceId, TransactionStage.FAILED);
  }
  async findWithdrawalRequests(paginationDto: PaginationDto) {
    return await this.walletTransactionRepository.find({
      where: {
        type: TransactionType.WITHDRAWAL,
        stage: TransactionStage.PENDING,
      },
      relations: ['user', 'wallet'],
    });
  }

  async getTotalTransactionsAmountByUserId(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const today = new Date();
    // Set default date range to last month to today if not provided
    if (!startDate) {
      startDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate() + 1, // ✔ correct
      );
    }
    if (!endDate) {
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );
    }
    // Query to calculate total amount
    const result = await this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.wallet', 'wallet')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.stage = :stage', {
        stage: TransactionStage.SETTLED,
      })
      .andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .select('SUM(transaction.amount)', 'total')
      .getRawOne();

    return result.total || 0;
  }
}
