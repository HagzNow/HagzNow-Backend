import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { paginate } from 'src/common/utils/paginate';
import { applySorting } from 'src/common/utils/sort.util';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { TransactionStage } from './interfaces/transaction-stage.interface';
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
    createwqalletTransactionDto: CreateWalletTransactionDto,
    user: User,
  ) {
    const wallet = await this.walletService.findOneByUserId(user.id);
    if (!wallet) {
      return ApiResponseUtil.throwError(
        'Wallet not found for this user',
        'WALLET_NOT_FOUND',
        400,
      );
    }

    const newWalletTransaction = this.walletTransactionRepository.create({
      wallet,
      ...createwqalletTransactionDto,
    });
    return await this.walletTransactionRepository.save(newWalletTransaction);
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const wallet = await this.walletService.findOneByUserId(user.id);
    if (!wallet) {
      return ApiResponseUtil.throwError(
        'Wallet not found for this user',
        'WALLET_NOT_FOUND',
        400,
      );
    }
    const query = this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId: wallet.id });

    applySorting(query, { createdAt: 'DESC' }, 'transaction');

    return await paginate(query, paginationDto);
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
  async updateByRefernceId(referenceId: string, stage: TransactionStage) {
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
  async prcessFailedTransaction(referenceId: string) {
    return await this.updateByRefernceId(referenceId, TransactionStage.FAILED);
  }
}
