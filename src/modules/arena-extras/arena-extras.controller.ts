import { Controller, Get, Query } from '@nestjs/common';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ArenaExtraDto } from './dto/arena-extra.dto';
import { ArenaExtrasService } from './arena-extras.service';

@Controller('arenas-extras')
export class ArenaExtrasController {
  constructor(private readonly arenaExtrasService: ArenaExtrasService) {}

  @Get()
  @Serialize(ArenaExtraDto)
  getActiveExtras(@Query('arenaId') arenaId: string) {
    return this.arenaExtrasService.getActiveExtras(arenaId);
  }
}
