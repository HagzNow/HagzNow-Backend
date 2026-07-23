import { HttpException } from '@nestjs/common';
import { UserRole } from 'src/modules/users/interfaces/userRole.interface';
import { ReservationValidator } from './reservation-validator.service';

describe('ReservationValidator', () => {
  let validator: ReservationValidator;
  let usersService: { isActiveAdmin: jest.Mock };
  let reservationRepository: { findOne: jest.Mock };

  beforeEach(() => {
    usersService = {
      isActiveAdmin: jest.fn().mockResolvedValue(false),
    };
    reservationRepository = {
      findOne: jest.fn(),
    };
    validator = new ReservationValidator(
      {} as never,
      {} as never,
      usersService as never,
      {} as never,
      reservationRepository as never,
    );
  });

  it('accepts and normalizes a partial manual payment', () => {
    expect(validator.validateInitialPaidAmount(50.125, 100)).toBe(50.13);
  });

  it('rejects a manual payment above the reservation total', () => {
    expect(() => validator.validateInitialPaidAmount(100.01, 100)).toThrow(
      HttpException,
    );
  });

  it.each([
    ['matching profile id', { id: 'user-id' }, undefined],
    [
      'linked profile user id',
      { id: 'profile-id', userId: 'user-id' },
      undefined,
    ],
    [
      'loaded profile user relation',
      { id: 'profile-id', user: { id: 'user-id' } },
      undefined,
    ],
    ['arena owner', { id: 'profile-id' }, 'user-id'],
  ])('allows reservation details for the %s', async (_, customer, ownerId) => {
    reservationRepository.findOne.mockResolvedValue(
      createReservation(customer, ownerId),
    );

    await expect(
      validator.validateCanViewReservationDetails('reservation-id', {
        id: 'user-id',
        role: UserRole.USER,
      } as never),
    ).resolves.toBeUndefined();
    expect(usersService.isActiveAdmin).toHaveBeenCalledWith('user-id');
    expect(reservationRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'reservation-id' },
      loadEagerRelations: false,
      select: {
        id: true,
        customer: {
          id: true,
          userId: true,
          user: { id: true },
        },
        arena: {
          id: true,
          owner: { id: true },
        },
      },
      relations: {
        customer: { user: true },
        arena: { owner: true },
      },
    });
  });

  it('allows active admins without loading an access snapshot', async () => {
    usersService.isActiveAdmin.mockResolvedValue(true);

    await expect(
      validator.validateCanViewReservationDetails('reservation-id', {
        id: 'admin-id',
        role: UserRole.USER,
      } as never),
    ).resolves.toBeUndefined();
    expect(usersService.isActiveAdmin).toHaveBeenCalledWith('admin-id');
    expect(reservationRepository.findOne).not.toHaveBeenCalled();
  });

  it.each([
    ['an unrelated user', { id: 'unrelated-id', role: UserRole.USER }],
    ['an anonymous user', undefined],
  ])('rejects reservation details for %s', async (_, user) => {
    reservationRepository.findOne.mockResolvedValue(
      createReservation({ id: 'walk-in-profile' }),
    );

    await expect(
      validator.validateCanViewReservationDetails(
        'reservation-id',
        user as never,
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });
});

function createReservation(
  customer: {
    id: string;
    userId?: string;
    user?: { id: string };
  },
  ownerId = 'owner-id',
) {
  return {
    customer,
    arena: { owner: { id: ownerId } },
  } as never;
}
