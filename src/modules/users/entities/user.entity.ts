import * as bcrypt from 'bcrypt';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { WalletTransaction } from 'src/modules/wallets/entities/wallet-transaction.entity';
import { Wallet } from 'src/modules/wallets/entities/wallet.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { PayoutMethod } from '../interfaces/payout-method.interface';
import { UserRole } from '../interfaces/userRole.interface';
import { UserStatus } from '../interfaces/userStatus.interface';
import { Language } from 'src/common/enums/language.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fName: string;

  @Column()
  lName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  @Column()
  phone: string;

  @Column({ default: PayoutMethod.WALLET })
  payoutMethod: PayoutMethod;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.ar,
  })
  Language: Language;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  @JoinColumn()
  wallet: Wallet;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', nullable: true })
  nationalIdFront?: string;

  @Column({ type: 'varchar', nullable: true })
  nationalIdBack?: string;

  @Column({ type: 'varchar', nullable: true })
  selfieWithId?: string;

  @OneToMany(() => Arena, (arena) => arena.owner, {
    nullable: true,
  })
  arenas?: Arena[];

  @OneToMany(() => Review, (review) => review.user, { nullable: true })
  reviews?: Review[];

  @OneToMany(() => WalletTransaction, (transaction) => transaction.user)
  transactions: WalletTransaction[];

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashingPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      // if it doesn't look like a bcrypt hash
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}
