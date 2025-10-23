import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ArenaStatus } from '../interfaces/arena-status.interface';
import { Category } from 'src/modules/categories/entities/category.entity';

@Entity('arenas')
export class Arena {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 244 })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail: string;

  @Column({ type: 'int', default: 60 })
  minPeriod: number;

  @Column({ type: 'int', unsigned: true })
  openingHour: number;

  @Column({ type: 'int', unsigned: true })
  closingHour: number;

  @Column({ type: 'decimal' })
  pricePerHoue: number;

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
  @Column({ type: 'enum', enum: ArenaStatus, default: ArenaStatus.PENDING })
  status: ArenaStatus;

  @BeforeInsert()
  generateUUID() {
    this.uuid = uuidv4();
  }

  getDepositAmount(totalPrice: number): number {
    return (totalPrice * this.depositPercent) / 100;
  }
}
