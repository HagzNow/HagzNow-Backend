import { PartialType } from '@nestjs/mapped-types';
import { CreateArenaSlotDto } from './create-arena-slot.dto';

export class UpdateArenaSlotDto extends PartialType(CreateArenaSlotDto) {}
