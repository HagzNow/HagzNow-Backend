import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TransactionStage } from '../interfaces/transaction-stage.interface';
import { TransactionType } from '../interfaces/transaction-type.interface';
import { Wallet } from './wallet.entity';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStage,
    default: TransactionStage.INSTANT,
  })
  stage: TransactionStage;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true })
  referenceId?: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  wallet: Wallet;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: true })
  user: User;

  // @Column({ unique: true, nullable: true })
  // orderId: number;
}
