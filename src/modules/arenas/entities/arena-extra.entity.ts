import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Arena } from './arena.entity';
import { ReservationExtra } from 'src/modules/reservations/entities/reservation-extra.entity';

@Entity('arenas_extras')
export class ArenaExtra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'decimal' })
  price: number;

  @ManyToOne(() => Arena, (arena) => arena.extras, {
    onDelete: 'CASCADE',
  })
  arena: Arena;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @OneToMany(
    () => ReservationExtra,
    (reservationExtra) => reservationExtra.extra,
  )
  reservationExtras: ReservationExtra[];
}
