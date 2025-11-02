import { ArenaSlotsService } from './arena-slots.service';
import { ArenaSlotQueryDto } from './dto/arena-slot/arena-slot-query.dto';
import { ArenaParamsDto } from './dto/arena/arena-params.dto';
export declare class ArenaSlotsController {
    private readonly slotsService;
    constructor(slotsService: ArenaSlotsService);
    getAvailableSlots(params: ArenaParamsDto, query: ArenaSlotQueryDto): Promise<{
        arenaId: string;
        date: string;
        availableHours: number[];
    }>;
}
