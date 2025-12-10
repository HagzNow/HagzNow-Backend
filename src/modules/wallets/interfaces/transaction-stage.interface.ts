export enum TransactionStage {
  INSTANT = 'instant', // Happens immediately (e.g. deposit, withdraw, refund)
  HOLD = 'hold', // Held until user cannot cancel
  REFUND = 'refund', // Hold is cancelled (funds returned)
  SETTLED = 'settled', // Hold completed → sent to owner
  PENDING = 'pending', // Awaiting external processing
  FAILED = 'failed', // Transaction failed
  PROCESSED = 'processed', // Transaction has been processed
  REJECTED = 'rejected', // Transaction has been rejected
}
