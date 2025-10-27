import { Expose } from 'class-transformer';
import { ArenaExtra } from 'src/modules/arenas/entities/arena-extra.entity';
import { ArenaSlot } from 'src/modules/arenas/entities/arena-slot.entity';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentMethod } from '../interfaces/payment-methods.interface';
import { ReservationStatus } from '../interfaces/reservation-status.interface';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  dateOfReservation: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Arena, (arena) => arena.reservations, {
    onDelete: 'CASCADE',
  })
  arena: Arena;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.WALLET })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.HOLD,
  })
  status: ReservationStatus;

  // Computed property (not stored in DB)
  @Expose()
  get totalHours(): number {
    return this.slots?.length ?? 0;
  }

  @Column({ type: 'decimal' })
  playTotalAmount: number;

  @Column({ type: 'decimal' })
  extrasTotalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @OneToMany(() => ArenaSlot, (slot) => slot.reservation, {
    onDelete: 'CASCADE',
  })
  slots: ArenaSlot[];

  @ManyToMany(() => ArenaExtra, (extra) => extra.reservations, {
    onDelete: 'SET NULL',
  })
  @JoinTable({
    name: 'reservation_extras',
    joinColumn: { name: 'reservation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'extra_id', referencedColumnName: 'id' },
  })
  extras: ArenaExtra[];

  @ManyToOne(() => User, (user) => user.reservations, {
    onDelete: 'CASCADE',
  })
  user: User;
}
