export interface ReservationPaymentContext {
  userId: string;
  ownerId: string;
  adminId: string;
  referenceId: string;

  amounts: {
    player: number;
    owner: number;
    admin: number;
  };
}
