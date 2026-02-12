import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArenasModule } from '../arenas/arenas.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallets/wallets.module';
import { Reservation } from './entities/reservation.entity';
import { ReservationExtra } from './entities/reservation-extra.entity';
import { ReservationsProducer } from './queue/reservations.producer';
import { SettlementsProcessor } from './queue/settlements.processor';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './services/reservations.service';
import { ReservationExtrasService } from '../reservation-extras/reservation-extras.service';
import { CustomersModule } from '../customerProfiles/customers.module';
import { ReservationPolicy } from './services/reservation-policy.service';
import { ReservationPaymentService } from './services/reservation-payment.service';
import { AdminModule } from '../admin/admin.module';
import { ReservationPricingService } from './services/reservation-pricing.service';
import { ReservationExtrasModule } from '../reservation-extras/reservation-extras.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'settlements' }),
    TypeOrmModule.forFeature([Reservation]),
    ReservationExtrasModule,
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
    ReservationPricingService,
    ReservationPolicy,
    ReservationPaymentService,
    ReservationsProducer,
    SettlementsProcessor,
  ],
  exports: [ReservationsService],
})
export class ReservationsModule {}
