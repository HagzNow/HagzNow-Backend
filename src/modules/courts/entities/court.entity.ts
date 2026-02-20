import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourtSlot } from '../../court-slots/entities/court-slot.entity';
import { Arena } from '../../arenas/entities/arena.entity';
import { CourtStatus } from '../interfaces/court-status.interface';

@Entity('courts')
export class Court {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 244 })
  name: string;

  @Column({ type: 'enum', enum: CourtStatus, default: CourtStatus.ACTIVE })
  status: CourtStatus;

  @ManyToOne(() => Arena, (arena) => arena.courts)
  arena: Arena;

  @OneToMany(() => CourtSlot, (slot) => slot.court)
  slots: CourtSlot[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
