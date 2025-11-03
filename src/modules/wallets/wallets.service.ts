import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
  ) {}
  async create(user: User) {
    const newWallet = this.walletRepository.create({ user, balance: 0 });
    return await this.walletRepository.save(newWallet);
  }

  async getBalanceByUserId(userId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!wallet) {
      return 0;
    }
    return { avaibaleBalance: wallet.balance };
  }

  findOne(id: string) {
    return `This action returns a #${id} wallet`;
  }

  findOneByUserId(userId: string) {
    return this.walletRepository.findOne({ where: { user: { id: userId } } });
  }

  update(userId: string, balance: number) {
    return `This action updates a #${userId} wallet`;
  }
}
