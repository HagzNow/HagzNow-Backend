import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Arena } from '../../arenas/entities/arena.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number; // from 1 – 5 can be 4.5

  @Column({ type: 'varchar' })
  content: string;

  @ManyToOne(() => User, (user) => user.reviews, { eager: true })
  user: User;

  @ManyToOne(() => Arena, (arena) => arena.reviews, { onDelete: 'CASCADE' })
  arena: Arena;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;
}
