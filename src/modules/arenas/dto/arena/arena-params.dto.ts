import { IsUUID } from 'class-validator';

export class ArenaParamsDto {
  @IsUUID()
  arenaId: string;
}
