// reservations/queue/reservations.producer.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DateTime } from 'luxon';
import { ConnectionIsNotSetError } from 'typeorm';

@Injectable()
export class ReservationsProducer {
  constructor(@InjectQueue('settlements') private readonly queue: Queue) {}

  getJobId(reservationId: string) {
    return `settle-${reservationId}`;
  }

  async scheduleSettlement(
    reservationId: string,
    runAt: DateTime, // DateTime
    amount: number,
  ) {
    if (!runAt?.isValid) throw new Error('Invalid runAt DateTime');

    const delay = Math.max(0, runAt.toMillis() - Date.now());

    await this.queue.add(
      'settleReservation',
      { reservationId, amount },
      {
        jobId: `settle-${reservationId}`,
        delay,
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}
