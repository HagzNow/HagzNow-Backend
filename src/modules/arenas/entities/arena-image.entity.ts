import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Arena } from './arena.entity';

@Entity('arena_images')
export class ArenaImages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  path: string;

  @ManyToOne(() => Arena, (arena) => arena.images, {
    onDelete: 'CASCADE', // if category deleted, arena stays but category becomes null
  })
  arena: Arena;
}
