import { Expose } from 'class-transformer';
import { ArenaSlot } from 'src/modules/arenas/entities/arena-slot.entity';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { CustomerProfile } from 'src/modules/customerProfiles/entities/customer-profile.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentMethod } from '../interfaces/payment-methods.interface';
import { ReservationStatus } from '../interfaces/reservation-status.interface';
import { ReservationExtra } from './reservation-extra.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  dateOfReservation: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Arena, (arena) => arena.reservations, {
    onDelete: 'CASCADE',
    eager: true,
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
    eager: true,
  })
  slots: ArenaSlot[];

  @OneToMany(
    () => ReservationExtra,
    (reservationExtra) => reservationExtra.reservation,
    {
      cascade: true,
      eager: true,
    },
  )
  extras: ReservationExtra[];

  @ManyToOne(() => CustomerProfile, (customer) => customer.reservations, {
    onDelete: 'CASCADE',
    eager: true,
  })
  customer: CustomerProfile;
}
