import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationTransaction } from './entities/reservation-transaction.entity';
import { ReservationTransactionsController } from './reservation-transactions.controller';
import { ReservationTransactionsService } from './reservation-transactions.service';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationTransaction]),
    forwardRef(() => ReservationsModule),
  ],
  controllers: [ReservationTransactionsController],
  providers: [ReservationTransactionsService],
  exports: [ReservationTransactionsService],
})
export class ReservationTransactionsModule {}
