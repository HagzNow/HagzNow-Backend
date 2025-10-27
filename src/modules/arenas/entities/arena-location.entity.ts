import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Arena } from './arena.entity';

@Entity('arena_locations')
export class ArenaLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: false })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: false })
  lng: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  governorate: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @OneToOne(() => Arena, (arena) => arena.location, {
    onDelete: 'CASCADE',
  })
  arena: Arena;
}
