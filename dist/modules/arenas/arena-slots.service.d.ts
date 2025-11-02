import { Repository } from 'typeorm';
import { ArenaSlot } from './entities/arena-slot.entity';
import { Arena } from './entities/arena.entity';
export declare class ArenaSlotsService {
    private readonly slotRepo;
    private readonly arenaRepo;
    constructor(slotRepo: Repository<ArenaSlot>, arenaRepo: Repository<Arena>);
    getAvailableSlots(arenaId: string, date: string): Promise<{
        arenaId: string;
        date: string;
        availableHours: number[];
    }>;
}
