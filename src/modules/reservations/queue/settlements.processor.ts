// reservations/queue/settlements.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Reservation } from '../entities/reservation.entity';
import { ReservationsService } from '../reservations.service';

@Injectable()
@Processor('settlements', { concurrency: 5 })
export class SettlementsProcessor extends WorkerHost {
  constructor(private readonly reservationsService: ReservationsService) {
    super();
  }

  async process(job) {
    if (job.name === 'settleReservation') {
      this.reservationsService.settleReservation(job.data.reservationId);
    }
  }
}
