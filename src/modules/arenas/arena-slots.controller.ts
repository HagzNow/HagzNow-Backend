// arena-slots.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArenaSlotsService } from './arena-slots.service';

@Controller('arenas/:arenaId/slots')
export class ArenaSlotsController {
  constructor(private readonly slotsService: ArenaSlotsService) {}

  @Get('available')
  async getAvailableSlots(
    @Param('arenaId') arenaId: string,
    @Query('date') date: string,
  ) {
    console.log(
      'Fetching available slots for arena:',
      arenaId,
      'on date:',
      date,
    );
    return this.slotsService.getAvailableSlots(arenaId, date);
  }
}
