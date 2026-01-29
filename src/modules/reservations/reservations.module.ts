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
import { ReservationsService } from './reservations.service';
import { CustomersModule } from '../customerProfiles/customers.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'settlements' }),
    TypeOrmModule.forFeature([Reservation]),
    ArenasModule,
    AuthModule,
    UsersModule,
    WalletModule,
    CustomersModule,
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationsProducer, // <-- add
    SettlementsProcessor,
  ], // <-- add (so the processor is discovered)],
  exports: [ReservationsService],
})
export class ReservationsModule {}
