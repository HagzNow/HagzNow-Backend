export enum TransactionStage {
  INSTANT = 'instant', // Happens immediately (e.g. deposit, withdraw, refund)
  HOLD = 'hold', // Held until user cannot cancel
  RELEASED = 'released', // Hold is cancelled (funds returned)
  SETTLED = 'settled', // Hold completed → sent to owner
}
