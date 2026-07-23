import { Reservation } from './entities/reservation.entity';
import { ReservationsService } from './services/reservations.service';

describe('ReservationsService loading', () => {
  const reservation = { id: 'reservation-id' } as Reservation;
  const reservationRepository = {
    findOne: jest.fn(),
  };
  const reservationValidator = {
    validateCanViewReservationDetails: jest.fn(),
    validateReservationId: jest.fn(),
    validateReservationExists: jest.fn(
      (loadedReservation) => loadedReservation,
    ),
  };
  const service = new ReservationsService(
    reservationRepository as never,
    reservationValidator as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads a plain reservation without eager relations', async () => {
    reservationRepository.findOne.mockResolvedValue(reservation);

    await expect(service.findOne(reservation.id)).resolves.toBe(reservation);
    expect(reservationRepository.findOne).toHaveBeenCalledWith({
      where: { id: reservation.id },
      loadEagerRelations: false,
    });
    expect(reservationValidator.validateReservationId).toHaveBeenCalledWith(
      reservation.id,
    );
    expect(reservationValidator.validateReservationExists).toHaveBeenCalledWith(
      reservation,
    );
  });

  it('loads the complete reservation aggregate newest first', async () => {
    reservationRepository.findOne.mockResolvedValue(reservation);

    await expect(service.findOneWithRelations(reservation.id)).resolves.toBe(
      reservation,
    );
    expect(reservationRepository.findOne).toHaveBeenCalledWith({
      where: { id: reservation.id },
      loadEagerRelations: false,
      relations: {
        arena: { owner: true },
        customer: { user: true },
        transactions: {
          user: true,
          extras: { extra: true },
        },
        slots: { court: true },
      },
      order: {
        transactions: {
          createdAt: 'DESC',
        },
      },
    });
  });

  it('authorizes a lightweight context before loading full details', async () => {
    const user = { id: 'user-id' };
    reservationRepository.findOne.mockResolvedValue(reservation);

    await expect(
      service.findDetails(reservation.id, user as never),
    ).resolves.toBe(reservation);

    expect(
      reservationValidator.validateCanViewReservationDetails,
    ).toHaveBeenCalledWith(reservation.id, user);
    expect(reservationRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('does not load full details when access is rejected', async () => {
    reservationValidator.validateCanViewReservationDetails.mockImplementationOnce(
      () => {
        throw new Error('forbidden');
      },
    );

    await expect(
      service.findDetails(reservation.id, { id: 'other-id' } as never),
    ).rejects.toThrow('forbidden');
    expect(reservationRepository.findOne).not.toHaveBeenCalled();
  });
});
