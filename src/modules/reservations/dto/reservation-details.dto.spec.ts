import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';
import { ReservationDetailsDto } from './reservation-details.dto';

describe('ReservationDetailsDto transactions', () => {
  it('serializes complete transaction history without sensitive relations', () => {
    const details = plainToInstance(
      ReservationDetailsDto,
      {
        id: 'reservation-id',
        transactions: [
          createTransaction('newest', TransactionStage.CANCELED, '12.50'),
          createTransaction('failed', TransactionStage.FAILED, '7.25'),
          createTransaction('oldest', TransactionStage.SETTLED, '20.00'),
        ],
      },
      { excludeExtraneousValues: true },
    );

    expect(details.transactions.map(({ id }) => id)).toEqual([
      'newest',
      'failed',
      'oldest',
    ]);
    expect(details.transactions.map(({ stage }) => stage)).toEqual([
      TransactionStage.CANCELED,
      TransactionStage.FAILED,
      TransactionStage.SETTLED,
    ]);
    expect(details.transactions[0]).toMatchObject({
      amount: 12.5,
      type: 'manual',
      method: 'manual',
      note: 'transaction note',
      createdBy: {
        id: 'actor-id',
        fName: 'Arena',
        lName: 'Owner',
        role: 'owner',
      },
      extras: [
        {
          id: 'reservation-extra-id',
          name: 'Ball',
          price: 10.15,
          quantity: 2,
          subtotal: 20.3,
          isActive: true,
        },
      ],
    });
    expect(details.transactions[0]).not.toHaveProperty('reservation');
    expect(details.transactions[0]).not.toHaveProperty('walletTransaction');
    expect(details.transactions[0].createdBy).not.toHaveProperty('email');
    expect(details.transactions[0].createdBy).not.toHaveProperty('phone');
    expect(details.transactions[0].createdBy).not.toHaveProperty('password');
  });
});

function createTransaction(
  id: string,
  stage: TransactionStage,
  amount: string,
) {
  return {
    id,
    amount,
    type: 'manual',
    method: 'manual',
    stage,
    note: 'transaction note',
    createdAt: new Date('2030-01-01T10:00:00.000Z'),
    user: {
      id: 'actor-id',
      fName: 'Arena',
      lName: 'Owner',
      role: 'owner',
      email: 'private@example.com',
      phone: '01000000000',
      password: 'secret',
    },
    extras: [
      {
        id: 'reservation-extra-id',
        extra: { name: 'Ball' },
        priceAtReservation: '10.15',
        quantity: 2,
        cancelledAt: null,
      },
    ],
    reservation: { id: 'recursive-reservation' },
    walletTransaction: { id: 'wallet-transaction-id' },
  };
}
