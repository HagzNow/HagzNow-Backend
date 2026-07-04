import { ArenaExtra } from 'src/modules/arena-extras/entities/arena-extra.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { ReservationTransaction } from 'src/modules/reservation-transactions/entities/reservation-transaction.entity';

@Entity('reservation_extras')
export class ReservationExtra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ArenaExtra, (extra) => extra.reservationExtras, {
    eager: true,
  })
  extra: ArenaExtra;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtReservation: number;

  @ManyToOne(() => ReservationTransaction, (tx) => tx.extras, {
    onDelete: 'CASCADE',
  })
  transaction: ReservationTransaction;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date | null;
}
