import { Category } from 'src/modules/categories/entities/category.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { ArenaStatus } from '../interfaces/arena-status.interface';
import { ArenaExtra } from './arena-extra.entity';
import { ArenaImage } from './arena-image.entity';
import { ArenaLocation } from './arena-location.entity';
import { ArenaSlot } from './arena-slot.entity';

@Entity('arenas')
export class Arena {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'decimal', default: 100 })
  depositPercent: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  policy: string;

  @ManyToOne(() => Category, (category) => category.arenas, {
    onDelete: 'RESTRICT', // if category deleted, arena stays but category becomes null
    eager: true,
  })
  category: Category;

  @OneToMany(() => ArenaImage, (image) => image.arena, {
    cascade: true,
    onDelete: 'CASCADE',
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

  @OneToMany(() => ArenaExtra, (extra) => extra.arena, {
    cascade: true,
    eager: true,
  })
  extras: ArenaExtra[];

  @OneToMany(() => ArenaSlot, (slot) => slot.arena)
  slots: ArenaSlot[];

  @OneToMany(() => Reservation, (reservation) => reservation.arena)
  reservations: Reservation[];

  @ManyToOne(() => User, (user) => user.arenas, {
    eager: true,
  })
  @JoinColumn({ name: 'ownerId' }) // <- this sets the column name
  owner: User;

  @OneToMany(() => Review, (review) => review.arena, {
    nullable: true,
    eager: true,
  })
  reviews: Review[];

  private get adminFeeRate(): number {
    return Number(process.env.ADMIN_FEE_RATE) || 0;
  }

  private normalizeExtras(extras?: ArenaExtra[]): ArenaExtra[] {
    return extras ?? [];
  }

  playAmount(hours: number): number {
    return Number(this.pricePerHour) * hours;
  }

  extrasAmount(extras?: ArenaExtra[]): number {
    return this.normalizeExtras(extras).reduce(
      (sum, extra) => sum + Number(extra.price),
      0,
    );
  }

  totalAmount(hours: number, extras?: ArenaExtra[]): number {
    return this.playAmount(hours) + this.extrasAmount(extras);
  }

  ownerAmount(hours: number, extras?: ArenaExtra[]): number {
    return (
      this.playerTotalAmount(hours, extras) - this.adminAmount(hours, extras)
    );
  }

  adminAmount(hours: number, extras?: ArenaExtra[]): number {
    return this.totalAmount(hours, extras) * this.adminFeeRate;
  }

  depositAmount(hours: number): number {
    return (this.playAmount(hours) * this.depositPercent) / 100;
  }

  playerTotalAmount(hours: number, extras?: ArenaExtra[]): number {
    return this.depositAmount(Number(hours)) + this.extrasAmount(extras);
  }
  totalAvailableHours(): number {
    return this.closingHour - this.openingHour;
  }
}
