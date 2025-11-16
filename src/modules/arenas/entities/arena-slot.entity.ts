import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Arena } from './arena.entity';

@Entity('arena_slots')
@Index('unique_arena_date_hour', ['arena', 'date', 'hour', 'isCanceled'], {
  unique: true,
})
export class ArenaSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'int', unsigned: true })
  hour: number;

  @Column({ default: false })
  isCanceled: boolean;

  @ManyToOne(() => Arena, (arena) => arena.slots, { onDelete: 'CASCADE' })
  arena: Arena;

  @ManyToOne(() => Reservation, (reservation) => reservation.slots, {
    onDelete: 'CASCADE',
  })
  reservation: Reservation;
}
