import { Arena } from 'src/modules/arenas/entities/arena.entity';

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 244 })
  name: string;
  @OneToMany(() => Arena, (arena) => arena.category)
  arenas: Arena[];
}
