import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationExtra } from '../reservations/entities/reservation-extra.entity';
import { Module } from '@nestjs/common';
import { ReservationExtrasService } from './reservation-extras.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationExtra])],
  controllers: [],
  providers: [ReservationExtrasService],
  exports: [ReservationExtrasService],
})
export class ReservationExtrasModule {}
