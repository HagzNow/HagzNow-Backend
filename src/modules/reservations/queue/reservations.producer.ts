// reservations/queue/reservations.producer.ts
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { DateTime } from 'luxon';

@Injectable()
export class ReservationsProducer {
  constructor(@InjectQueue('settlements') private readonly queue: Queue) {}

  getJobId(reservationId: string) {
    return `settle-${reservationId}`;
  }

  async removeSettlement(reservationId: string) {
    const jobId = this.getJobId(reservationId);
    const job = await this.queue.getJob(jobId);

    if (!job) return false; // nothing to remove

    await job.remove();
    return true;
  }

  async scheduleSettlement(
    reservationId: string,
    runAt: DateTime, // DateTime
    amount: number,
  ) {
    if (!runAt?.isValid) throw new Error('Invalid runAt DateTime');

    const delay = Math.max(0, runAt.toMillis() - Date.now());

    // Add job to the queue
    const job = await this.queue.add(
      'settleReservation',
      { reservationId, amount },
      {
        jobId: `settle-${reservationId}`,
        delay,
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    // Log job details to verify
    console.log('Settlement job scheduled:', {
      id: job.id,
      name: job.name,
      data: job.data,
      delay: job.delay,
      timestamp: job.timestamp,
    });

    return job; // Return the job so the caller can inspect it
  }
}
