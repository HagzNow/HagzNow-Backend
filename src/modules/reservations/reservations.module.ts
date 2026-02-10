import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArenasModule } from '../arenas/arenas.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallets/wallets.module';
import { Reservation } from './entities/reservation.entity';
import { ReservationsProducer } from './queue/reservations.producer';
import { SettlementsProcessor } from './queue/settlements.processor';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './services/reservations.service';
import { CustomersModule } from '../customerProfiles/customers.module';
import { ReservationPolicy } from './services/reservation-policy.service';
import { ReservationPaymentService } from './services/reservation-payment.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'settlements' }),
    TypeOrmModule.forFeature([Reservation]),
    ArenasModule,
    AuthModule,
    UsersModule,
    WalletModule,
    CustomersModule,
    AdminModule,
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationPolicy,
    ReservationPaymentService,
    ReservationsProducer,
    SettlementsProcessor,
  ],
  exports: [ReservationsService],
})
export class ReservationsModule {}
