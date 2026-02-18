import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Court } from '../../courts/entities/court.entity';

@Entity('court_slots')
@Index('unique_active_court_slot', ['court', 'date', 'hour'], {
  unique: true,
  where: `"cancelledAt" IS NULL`,
})
export class CourtSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'int', unsigned: true })
  hour: number;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @ManyToOne(() => Court, (court) => court.slots, { onDelete: 'CASCADE' })
  court: Court;

  @ManyToOne(() => Reservation, (reservation) => reservation.slots, {
    onDelete: 'CASCADE',
  })
  reservation: Reservation;
}
