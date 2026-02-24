export enum TransactionType {
  DEPOSIT = 'deposit', // User adds money to wallet
  WITHDRAWAL = 'withdrawal', // Owner withdraws from wallet
  PAYMENT = 'payment', // Paying for a reservation
  REFUND = 'refund', // Refund issued to user
  FEE = 'fee', // Service fee charged
  MANUAL = 'manual', // Manually created transaction (e.g. adjustment)
}
