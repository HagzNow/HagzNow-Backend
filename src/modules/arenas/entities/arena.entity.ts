import { Category } from 'src/modules/categories/entities/category.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ArenaStatus } from '../interfaces/arena-status.interface';
import { ArenaExtra } from './arena-extra.entity';
import { ArenaImage } from './arena-image.entity';
import { ArenaLocation } from './arena-location.entity';

@Entity('arenas')
export class Arena {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 244 })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  thumbnail: string;

  @Column({ type: 'int', default: 60 })
  minPeriod: number;

  @Column({ type: 'int', unsigned: true })
  openingHour: number;

  @Column({ type: 'int', unsigned: true })
  closingHour: number;

  @Column({ type: 'decimal' })
  pricePerHour: number;

  @Column({ type: 'decimal', default: 20 })
  depositPercent: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  policy: string;

  @ManyToOne(() => Category, (category) => category.arenas, {
    onDelete: 'SET NULL', // if category deleted, arena stays but category becomes null
  })
  category: Category;

  @OneToMany(() => ArenaImage, (image) => image.arena, {
    cascade: true,
    onDelete: 'CASCADE', // if category deleted, arena stays but category becomes null
    eager: true,
  })
  images: ArenaImage[];

  @OneToOne(() => ArenaLocation, (location) => location.arena, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn() // 👈 Add this decorator
  location: ArenaLocation;

  @Column({ type: 'enum', enum: ArenaStatus, default: ArenaStatus.PENDING })
  status: ArenaStatus;

  @BeforeInsert()
  generateUUID() {
    this.uuid = uuidv4();
  }

  @OneToMany(() => ArenaExtra, (extra) => extra.arena, {
    cascade: true,
    eager: true,
  })
  extras: ArenaExtra[];

  getDepositAmount(totalPrice: number): number {
    return (totalPrice * this.depositPercent) / 100;
  }
}
