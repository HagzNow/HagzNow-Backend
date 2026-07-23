import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationTransaction } from './entities/reservation-transaction.entity';
import { ReservationTransactionsController } from './reservation-transactions.controller';
import { ReservationTransactionsService } from './reservation-transactions.service';
import { ReservationExtrasModule } from '../reservation-extras/reservation-extras.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservationTransaction]),
    ReservationExtrasModule,
  ],
  controllers: [ReservationTransactionsController],
  providers: [ReservationTransactionsService],
  exports: [ReservationTransactionsService],
})
export class ReservationTransactionsModule {}
