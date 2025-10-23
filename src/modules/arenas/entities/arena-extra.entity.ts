import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Arena } from './arena.entity';

@Entity('arenas_extras')
export class ArenaExtra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'decimal' })
  price: number;

  @ManyToOne(() => Arena, (arena) => arena.extras, {
    onDelete: 'CASCADE',
  })
  arena: Arena;
}
