import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReservationConfig implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    void this.extrasDepositRate;
  }

  get extrasDepositRate(): number {
    const configuredRate = this.configService.get<string>(
      'EXTRAS_DEPOSIT_RATE',
    );

    if (configuredRate === undefined || configuredRate === '') {
      return 1;
    }

    const rate = Number(configuredRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
      throw new Error('EXTRAS_DEPOSIT_RATE must be a number between 0 and 1');
    }

    return rate;
  }
}
