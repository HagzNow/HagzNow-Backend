import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'; // <-- Import v4 function
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
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

  async hasEnoughBalance(
    userId: string,
    amount: number,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Wallet)
      : this.walletRepository;

    const wallet = await this.findOneByUserId(userId, repo.manager);
    if (!wallet) return false;
    return wallet.balance >= amount;
  }

  async validateSufficientBalance(
    userId: string,
    amount: number,
    manager?: EntityManager,
  ): Promise<void | never> {
    const hasEnough = await this.hasEnoughBalance(userId, amount, manager);
    if (!hasEnough) {
      return ApiResponseUtil.throwError(
        'errors.wallet.insufficient_funds',
        'INSUFFICIENT_FUNDS',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async addToHeldAmount(
    userId: string,
    amount: number,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Wallet)
      : this.walletRepository;
    const wallet = await this.findOneByUserIdForUpdate(userId, repo.manager);
    if (!wallet) return false;
    wallet.heldAmount = Number(wallet.heldAmount) + amount;
    await repo.save(wallet);
    return true;
  }

  async removeFromHeldAmount(
    userId: string,
    amount: number,
    manager?: EntityManager,
  ): Promise<boolean | never> {
    const repo = manager
      ? manager.getRepository(Wallet)
      : this.walletRepository;
    const wallet = await this.findOneByUserIdForUpdate(userId, repo.manager);
    if (!wallet) return false;
    if (Number(wallet.heldAmount) < amount) {
      return ApiResponseUtil.throwError(
        'errors.wallet.insufficient_held_amount',
        'INSUFFICIENT_HELD_AMOUNT',
        HttpStatus.BAD_REQUEST,
      );
    }
    wallet.heldAmount = Number(wallet.heldAmount) - amount;
    await repo.save(wallet);
    return true;
  }

  async lockAmount(userId: string, amount: number, manager?: EntityManager): Promise<boolean | never> {
    const repo = manager
      ? manager.getRepository(Wallet)
      : this.walletRepository;

    const wallet = await this.findOneByUserIdForUpdate(userId, repo.manager);
    if (!wallet)
      return ApiResponseUtil.throwError(
        'errors.wallet.not_found',
        'WALLET_NOT_FOUND',
        HttpStatus.BAD_REQUEST,
      );

    if (Number(wallet.balance) < amount) {
      return ApiResponseUtil.throwError(
        'errors.wallet.insufficient_funds',
        'INSUFFICIENT_FUNDS',
        HttpStatus.BAD_REQUEST,
      );
    }
    wallet.balance = Number(wallet.balance) - amount;
    wallet.heldAmount = Number(wallet.heldAmount) + amount;
    await repo.save(wallet);
    return true;
  }

  async unlockAmount(userId: string, amount: number, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Wallet)
      : this.walletRepository;
    const wallet = await this.findOneByUserIdForUpdate(userId, repo.manager);
    if (!wallet)
      return ApiResponseUtil.throwError(
        'errors.wallet.not_found',
        'WALLET_NOT_FOUND',
        HttpStatus.BAD_REQUEST,
      );
    if (Number(wallet.heldAmount) < amount) {
      return ApiResponseUtil.throwError(
        'errors.wallet.insufficient_held_amount',
        'INSUFFICIENT_HELD_AMOUNT',
        HttpStatus.BAD_REQUEST,
      );
    }
    wallet.heldAmount = Number(wallet.heldAmount) - amount;
    await repo.save(wallet);
    return true;
  }

  async releaseHeldAmount(
    userId: string,
    amount: number,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Wallet)
      : this.walletRepository;
    const wallet = await this.findOneByUserIdForUpdate(userId, repo.manager);
    if (!wallet)
      return ApiResponseUtil.throwError(
        'errors.wallet.not_found',
        'WALLET_NOT_FOUND',
        HttpStatus.BAD_REQUEST,
      );
    if (Number(wallet.heldAmount) < amount) {
      return ApiResponseUtil.throwError(
        'errors.wallet.insufficient_held_amount',
        'INSUFFICIENT_HELD_AMOUNT',
        HttpStatus.BAD_REQUEST,
      );
    }
    wallet.heldAmount = Number(wallet.heldAmount) - amount;
    wallet.balance = Number(wallet.balance) + amount;
    await repo.save(wallet);
    return true;
  }

  async getBalanceByUser(user: User) {
    const wallet = await this.findOneByUserId(user.id);
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

  private async findOneByUserIdForUpdate(
    userId: string,
    manager: EntityManager,
  ) {
    return manager.findOne(Wallet, {
      where: { user: { id: userId } },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async deduceAmount(amount: number, user: User, manager?: EntityManager): Promise<{ message: string; balance: number } | never> {
    const repo = manager
      ? manager.getRepository(Wallet)
      : this.walletRepository;
    const wallet = await this.findOneByUserId(user.id, manager);
    if (!wallet) {
      return ApiResponseUtil.throwError(
        'errors.wallet.not_found',
        'WALLET_NOT_FOUND',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (wallet.balance < amount) {
      return ApiResponseUtil.throwError(
        'errors.wallet.insufficient_funds',
        'INSUFFICIENT_FUNDS',
        HttpStatus.BAD_REQUEST,
      );
    }
    wallet.balance = Number(wallet.balance) - amount;
    await repo.save(wallet);
    return { message: 'Withdrawal successful', balance: wallet.balance };
  }

  async requestWithdrawal(amount: number, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate amount
      if (!amount || amount <= 0) {
        throw ApiResponseUtil.throwError(
          'errors.wallet.invalid_amount',
          'INVALID_AMOUNT',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 2. Ensure balance is enough
      const hasEnough = await this.hasEnoughBalance(user.id, amount);
      if (!hasEnough) {
        throw ApiResponseUtil.throwError(
          'errors.wallet.insufficient_funds',
          'INSUFFICIENT_FUNDS',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Lock amount
      await this.lockAmount(user.id, amount, queryRunner.manager);

      // 4. Create local INSTANT wallet transaction
      const newWithdrawTx = await this.walletTransactionService.create(
        {
          amount,
          stage: TransactionStage.PENDING,
          type: TransactionType.WITHDRAWAL,
          referenceId: uuidv4(),
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
  async findWithdrawalRequests(paginationDto: PaginationDto) {
    return await this.walletTransactionService.findWithdrawalRequests(
      paginationDto,
    );
  }

  async acceptWithdrawalRequests(transactionId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction =
        await this.walletTransactionService.findOne(transactionId);
      if (!transaction) {
        return ApiResponseUtil.throwError(
          'errors.wallet_transaction.not_found',
          'WALLET_TRANSACTION_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
      if (
        transaction.stage !== TransactionStage.PENDING ||
        transaction.type !== TransactionType.WITHDRAWAL
      ) {
        return ApiResponseUtil.throwError(
          'errors.wallet_transaction.invalid_stage_or_type',
          'INVALID_TRANSACTION_STAGE',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (transaction.user.role !== UserRole.OWNER) {
        return ApiResponseUtil.throwError(
          'errors.wallet.invalid_user_role',
          'INVALID_USER_ROLE',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!transaction.referenceId) {
        return ApiResponseUtil.throwError(
          'errors.wallet_transaction.missing_reference_id',
          'MISSING_REFERENCE_ID',
          HttpStatus.BAD_REQUEST,
        );
      }
      // Make sure the there isn't any settled transaction with the same referenceId
      const existingSettledTx =
        await this.walletTransactionService.findSettledTransactionsByReferenceId(
          transaction.referenceId,
          queryRunner.manager,
        );

      if (existingSettledTx) {
        return ApiResponseUtil.throwError(
          'errors.wallet_transaction.duplicate_settled_transaction',
          'DUPLICATE_SETTLED_TRANSACTION',
          HttpStatus.CONFLICT,
        );
      }
      // update transaction stage to processed
      transaction.stage = TransactionStage.PROCESSED;

      // Create SETTLED transaction
      await this.walletTransactionService.create(
        {
          amount: transaction.amount,
          stage: TransactionStage.SETTLED,
          type: TransactionType.WITHDRAWAL,
          referenceId: transaction.referenceId,
        },
        transaction.user,
        queryRunner.manager,
      );

      // Unlock amount from user's heldAmount
      await this.unlockAmount(
        transaction.user.id,
        transaction.amount,
        queryRunner.manager,
      );
      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
      return {
        message: 'messages.wallet_transaction.withdrawal_request_accepted',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectWithdrawalRequests(transactionId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const transaction =
        await this.walletTransactionService.findOne(transactionId);
      if (!transaction) {
        return ApiResponseUtil.throwError(
          'errors.wallet_transaction.not_found',
          'WALLET_TRANSACTION_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
      if (
        transaction.stage !== TransactionStage.PENDING ||
        transaction.type !== TransactionType.WITHDRAWAL
      ) {
        return ApiResponseUtil.throwError(
          'errors.wallet_transaction.invalid_stage_or_type',
          'INVALID_TRANSACTION_STAGE',
          HttpStatus.BAD_REQUEST,
        );
      }
      // Release held amount back to user's balance
      await this.releaseHeldAmount(
        transaction.user.id,
        transaction.amount,
        queryRunner.manager,
      );
      // Update transaction stage to processed
      transaction.stage = TransactionStage.PROCESSED;

      // Add transaction for rejected
      await this.walletTransactionService.create(
        {
          amount: transaction.amount,
          stage: TransactionStage.REJECTED,
          type: TransactionType.WITHDRAWAL,
          referenceId: transaction.referenceId,
        },
        transaction.user,
        queryRunner.manager,
      );
      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
      return {
        message: 'messages.wallet_transaction.withdrawal_request_rejected',
      };
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
