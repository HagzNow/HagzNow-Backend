import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('customerProfiles')
export class CustomerProfile {
  // same as User id
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fName: string;

  @Column()
  lName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  userId?: string; // optional link to User

  @OneToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @OneToMany(() => Reservation, (r) => r.customer)
  reservations: Reservation[];
}
