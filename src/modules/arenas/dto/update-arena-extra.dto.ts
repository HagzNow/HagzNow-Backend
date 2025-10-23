import { PartialType } from '@nestjs/swagger';
import { CreateArenaExtraDto } from './create-arena-extra.dto';

export class UpdateArenaExtraDto extends PartialType(CreateArenaExtraDto) {}
