import { Expose } from 'class-transformer';
import { CourtSlot } from 'src/modules/court-slots/entities/court-slot.entity';
import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { CustomerProfile } from 'src/modules/customerProfiles/entities/customer-profile.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentMethod } from '../../../common/interfaces/transactions/payment-methods.interface';
import { ReservationStatus } from '../interfaces/reservation-status.interface';
import { ReservationExtra } from './reservation-extra.entity';
import { ReservationTransaction } from 'src/modules/reservation-transactions/entities/reservation-transaction.entity';
import { ReservationPaymentStatus } from '../interfaces/reservation-payment-status.interface';

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

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  playTotalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  extrasTotalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  playDepositRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  extrasDepositRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  playDepositAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  extrasDepositAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  depositTotalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Expose()
  get remainingAmount(): number {
    const remainingAmountInCents = Math.max(
      Math.round(Number(this.totalAmount) * 100) -
        Math.round(Number(this.paidAmount) * 100),
      0,
    );

    return remainingAmountInCents / 100;
  }

  @Expose()
  get paymentStatus(): ReservationPaymentStatus {
    const paidAmountInCents = Math.round(Number(this.paidAmount) * 100);
    const totalAmountInCents = Math.round(Number(this.totalAmount) * 100);

    if (paidAmountInCents <= 0) {
      return ReservationPaymentStatus.UNPAID;
    }

    if (paidAmountInCents >= totalAmountInCents) {
      return ReservationPaymentStatus.PAID;
    }

    return ReservationPaymentStatus.PARTIALLY_PAID;
  }

  @OneToMany(() => CourtSlot, (slot) => slot.reservation, {
    onDelete: 'CASCADE',
    eager: true,
  })
  slots: CourtSlot[];

  @ManyToOne(() => CustomerProfile, (customer) => customer.reservations, {
    onDelete: 'CASCADE',
    eager: true,
  })
  customer: CustomerProfile;

  @OneToMany(
    () => ReservationTransaction,
    (transaction) => transaction.reservation,
    {
      cascade: true,
      eager: true,
    },
  )
  transactions: ReservationTransaction[];

  @Expose()
  get allExtras(): ReservationExtra[] {
    // Flattens the extras arrays from all transactions into one unified array
    return (
      this.transactions?.flatMap((tx) =>
        (tx.extras ?? []).filter((e) => e.cancelledAt === null),
      ) ?? []
    );
  }
}
