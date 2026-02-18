import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArenasModule } from '../arenas/arenas.module';
import { Arena } from '../arenas/entities/arena.entity';
import { User } from '../users/entities/user.entity';
import { OwnersController } from './owners.controller';
import { OwnersService } from './owners.service';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ReservationsModule } from '../reservations/reservations.module';
import { WalletModule } from '../wallets/wallets.module';
import { UploadModule } from '../upload/upload.module';
import { CourtSlotsModule } from '../court-slots/court-slots.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Arena]),
    forwardRef(() => ArenasModule),
    ArenasModule,
    ReservationsModule,
    WalletModule,
    UploadModule,
    ArenasModule,
    CourtSlotsModule,
  ],
  controllers: [OwnersController],
  providers: [OwnersService],
  exports: [OwnersService],
})
export class OwnersModule {}
