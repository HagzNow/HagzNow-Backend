import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', default: 0 })
  balance: number;

  @Column({ type: 'varchar', default: 'ج.م' })
  currency: string;

  @OneToOne(() => User, (user) => user.wallet)
  user: User;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet, {
    onDelete: 'RESTRICT',
  })
  transactions: WalletTransaction[];
}
