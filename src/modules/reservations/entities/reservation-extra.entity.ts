import { ArenaExtra } from 'src/modules/arena-extras/entities/arena-extra.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('reservation_extras')
export class ReservationExtra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Reservation, (r) => r.extras, {
    onDelete: 'CASCADE',
  })
  reservation: Reservation;

  @ManyToOne(() => ArenaExtra, (extra) => extra.reservationExtras, {
    eager: true,
  })
  extra: ArenaExtra;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtReservation: number;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date | null;
}
