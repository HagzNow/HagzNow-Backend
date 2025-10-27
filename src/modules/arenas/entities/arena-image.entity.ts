import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Arena } from './arena.entity';

@Entity('arena_images')
export class ArenaImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  path: string;

  @ManyToOne(() => Arena, (arena) => arena.images, {
    onDelete: 'CASCADE', // if category deleted, arena stays but category becomes null
  })
  arena: Arena;
}
