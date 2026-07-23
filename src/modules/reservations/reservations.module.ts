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
import { ReservationPricingService } from './services/reservation-pricing.service';
import { ReservationExtrasModule } from '../reservation-extras/reservation-extras.module';
import { ArenaExtrasModule } from '../arena-extras/arena-extras.module';
import { CourtSlotsModule } from '../court-slots/court-slots.module';
import { CourtsModule } from '../courts/courts.module';
import { ReservationTransactionsModule } from '../reservation-transactions/reservation-transactions.module';
import { ReservationFacade } from './services/facades/reservation.facade';
import { ReservationWorkFlowsController } from './reservation-workflows.controller';
import { ReservationConfig } from './reservation.config';
import { ReservationValidator } from './services/reservation-validator.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'settlements' }),
    TypeOrmModule.forFeature([Reservation]),
    ReservationExtrasModule,
    ArenasModule,
    ArenaExtrasModule,
    AuthModule,
    UsersModule,
    WalletModule,
    CustomersModule,
    AdminModule,
    CourtSlotsModule,
    CourtsModule,
    ReservationTransactionsModule,
  ],
  controllers: [ReservationsController, ReservationWorkFlowsController],
  providers: [
    ReservationFacade,
    ReservationsService,
    ReservationPricingService,
    ReservationPolicy,
    ReservationValidator,
    ReservationPaymentService,
    ReservationConfig,
    ReservationsProducer,
    SettlementsProcessor,
  ],
  exports: [ReservationsService, ReservationPricingService],
})
export class ReservationsModule {}
