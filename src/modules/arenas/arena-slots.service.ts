// arena-slots.service.ts

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { Repository } from 'typeorm';
import { ArenaSlot } from './entities/arena-slot.entity';
import { Arena } from './entities/arena.entity';

@Injectable()
export class ArenaSlotsService {
  constructor(
    @InjectRepository(ArenaSlot)
    private readonly slotRepo: Repository<ArenaSlot>,

    @InjectRepository(Arena)
    private readonly arenaRepo: Repository<Arena>,
  ) {}

  async getAvailableSlots(arenaId: number, date: string) {
    // Step 1: find arena
    const arena = await this.arenaRepo.findOne({ where: { id: arenaId } });
    //WORK
    if (!arena)
      return ApiResponseUtil.throwError(
        'Arena not found',
        'Arena_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );

    // Step 2: get all booked slots for that date
    const bookedSlots = await this.slotRepo.find({
      where: { arena: { id: arenaId }, date },
      select: ['hour'],
    });

    const bookedHours = bookedSlots.map((slot) => slot.hour);

    // Step 3: generate all possible hours for this arena
    const allHours: number[] = [];
    for (let h = arena.openingHour; h < arena.closingHour; h++) {
      allHours.push(h);
    }

    // Step 4: filter available ones
    const availableHours = allHours.filter((h) => !bookedHours.includes(h));

    return {
      arenaId,
      date,
      availableHours,
    };
  }
}
