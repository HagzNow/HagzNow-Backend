import { PartialType } from '@nestjs/swagger';
import { CreateArenaLocationDto } from './create-arena-location.dto';

export class UpdateArenaLocationDto extends PartialType(
  CreateArenaLocationDto,
) {}
