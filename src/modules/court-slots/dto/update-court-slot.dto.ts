import { PartialType } from '@nestjs/mapped-types';
import { CreateCourtSlotDto } from './create-court-slot.dto';

export class UpdateCourtSlotDto extends PartialType(CreateCourtSlotDto) {}
