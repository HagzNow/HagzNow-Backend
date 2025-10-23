import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { v4 as uuidv4 } from 'uuid';

import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 244 })
  name: string;
  @OneToMany(() => Arena, (arena) => arena.category)
  arenas: Arena[];
  @BeforeInsert()
  generateUUID() {
    this.uuid = uuidv4();
  }
}
