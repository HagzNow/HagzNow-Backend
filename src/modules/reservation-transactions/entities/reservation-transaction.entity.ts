import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { WalletTransaction } from 'src/modules/wallets/entities/wallet-transaction.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { PaymentMethod } from 'src/common/interfaces/transactions/payment-methods.interface';
import { TransactionType } from 'src/common/interfaces/transactions/transaction-type.interface';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';
import { ReservationExtra } from 'src/modules/reservations/entities/reservation-extra.entity';

@Entity('reservation_transactions')
export class ReservationTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Reservation, (r) => r.transactions, {
    onDelete: 'CASCADE',
  })
  reservation: Reservation;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  /** Business meaning */
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: TransactionStage,
    default: TransactionStage.INSTANT,
  })
  stage: TransactionStage;

  @ManyToOne(() => WalletTransaction, { nullable: true, eager: false })
  walletTransaction?: WalletTransaction;

  @OneToMany(
    () => ReservationExtra,
    (reservationExtra) => reservationExtra.transaction,
    {
      cascade: false,
      eager: true,
    },
  )
  extras: ReservationExtra[];

  @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: true })
  user: User;

  /** Optional note */
  @Column({ nullable: true })
  note?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
