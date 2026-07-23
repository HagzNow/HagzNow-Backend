import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationExtra } from '../reservations/entities/reservation-extra.entity';
import { Module } from '@nestjs/common';
import { ReservationExtrasService } from './reservation-extras.service';
import { ArenaExtrasModule } from '../arena-extras/arena-extras.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationExtra]), ArenaExtrasModule],
  controllers: [],
  providers: [ReservationExtrasService],
  exports: [ReservationExtrasService],
})
export class ReservationExtrasModule {}
