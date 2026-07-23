import { Arena } from 'src/modules/arenas/entities/arena.entity';
import { ArenaExtraWithQuantity } from 'src/modules/arenas/types/arena-extra-with-quantity.type';
import { ReservationAmounts } from './reservation-amounts.interface';

export interface ResolvedReservationContext {
  slots: number[];
  courts: any[];
  arena: Arena;
  arenaExtras: ArenaExtraWithQuantity[];
  amounts: ReservationAmounts;
}
