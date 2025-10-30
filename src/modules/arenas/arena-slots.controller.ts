// arena-slots.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArenaSlotsService } from './arena-slots.service';
import { ArenaSlotQueryDto } from './dto/arena-slot/arena-slot-query.dto';
import { ArenaParamsDto } from './dto/arena/arena-params.dto';

@Controller('arenas/:arenaId/slots')
export class ArenaSlotsController {
  constructor(private readonly slotsService: ArenaSlotsService) {}

  @Get('available')
  async getAvailableSlots(
    @Param() params: ArenaParamsDto,
    @Query() query: ArenaSlotQueryDto,
  ) {
    return this.slotsService.getAvailableSlots(params.arenaId, query.date);
  }
}
