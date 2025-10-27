import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Arena } from './arena.entity';

@Entity('arena_slots')
@Index('unique_arena_date_hour', ['arena', 'date', 'hour'], { unique: true })
export class ArenaSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'int', unsigned: true })
  hour: number;

  @ManyToOne(() => Arena, (arena) => arena.slots, { onDelete: 'CASCADE' })
  arena: Arena;
}
