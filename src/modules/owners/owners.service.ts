import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Injectable } from '@nestjs/common';
import { ArenasService } from '../arenas/arenas.service';
import { ReservationsService } from '../reservations/services/reservations.service';
import { WalletTransactionService } from '../wallets/wallet-transaction.service';
import { ArenaSlotsService } from '../arenas/arena-slots.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class OwnersService extends UsersService {
  constructor(
    eventEmitter: EventEmitter2,
    @InjectRepository(User) userRepository: Repository<User>,
    private readonly arenasService: ArenasService,
    private readonly reservationsService: ReservationsService,
    private readonly walletTransactionService: WalletTransactionService,
    private readonly ArenaSlotsService: ArenaSlotsService,
    uploadService: UploadService,
  ) {
    super(eventEmitter, userRepository, uploadService);
  }

  async getDashboardData(ownerId: string) {
    const totalArenas =
      await this.arenasService.getNumberOfArenasByOwner(ownerId);

    const totalReservations =
      await this.reservationsService.getNumberOfReservationsByOwner(ownerId);

    const totalEarnings =
      await this.walletTransactionService.getTotalTransactionsAmountByUserId(
        ownerId,
      );

    const occupancyRate =
      await this.ArenaSlotsService.getOccupancyRate(ownerId);

    const topArena =
      await this.arenasService.getMostReservedArenaByOwner(ownerId);

    const popularTime =
      await this.ArenaSlotsService.getPopularBookingTimes(ownerId);

    return {
      totalArenas,
      totalReservations,
      totalEarnings,
      occupancyRate,
      topArena,
      popularTime,
    };
  }
}
