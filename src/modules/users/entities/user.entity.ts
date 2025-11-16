import * as bcrypt from 'bcrypt';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
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
import { UserRole } from '../interfaces/userRole.interface';
import { UserStatus } from '../interfaces/userStatus.interface';

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
  @Column()
  phone: string;
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    eager: true,
  })
  @JoinColumn()
  wallet: Wallet;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @OneToMany(() => Arena, (arena) => arena.owner, {
    nullable: true,
  })
  arenas?: Arena[];

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
