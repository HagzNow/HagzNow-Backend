// reservations/queue/settlements.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ReservationFacade } from '../services/facades/reservation.facade';

@Injectable()
@Processor('settlements', { concurrency: 5 })
export class SettlementsProcessor extends WorkerHost {
  constructor(private readonly reservationFacade: ReservationFacade) {
    super();
  }

  async process(job) {
    try {
      await this.reservationFacade.settleReservationWorkflow(
        job.data.reservationId,
      );
      return;
    } catch (err) {
      console.log('Settlement failed — rescheduling for later...', err);

      // Reschedule after 10 minutes
      const thirtyMin = 10 * 60 * 1000;

      await job.moveToDelayed(Date.now() + thirtyMin);

      // IMPORTANT: return instead of throwing, because we manually rescheduled
      return;
    }
  }
}
