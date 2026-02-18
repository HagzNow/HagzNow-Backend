import { Controller, Get, Param, Query } from '@nestjs/common';
import { CourtSlotsService } from './court-slots.service';
import { CourtSlotQueryDto } from './dto/court-slot-query.dto';
import { ArenaParamsDto } from '../arenas/dto/arena/arena-params.dto';

@Controller('arenas/:arenaId/slots')
export class CourtSlotsController {
  constructor(private readonly slotsService: CourtSlotsService) {}

  @Get('available')
  async getAvailableSlots(
    @Param() params: ArenaParamsDto,
    @Query() query: CourtSlotQueryDto,
  ) {
    return this.slotsService.getAvailableSlotsForArena(
      params.arenaId,
      query.date,
    );
  }
}
