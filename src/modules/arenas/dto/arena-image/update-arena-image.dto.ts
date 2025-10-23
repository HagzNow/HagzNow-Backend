import { PartialType } from '@nestjs/swagger';
import { CreateArenaImageDto } from './create-arena-image.dto';

export class UpdateArenaImageDto extends PartialType(CreateArenaImageDto) {}
