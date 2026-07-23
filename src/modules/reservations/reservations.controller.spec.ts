import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './services/reservations.service';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  const reservationsService = {
    findDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        { provide: ReservationsService, useValue: reservationsService },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates authorized detail loading to the service', async () => {
    const user = { id: 'user-id' } as never;
    const reservation = { id: 'reservation-id' };
    reservationsService.findDetails.mockResolvedValue(reservation);

    await expect(controller.findOne('reservation-id', user)).resolves.toBe(
      reservation,
    );
    expect(reservationsService.findDetails).toHaveBeenCalledWith(
      'reservation-id',
      user,
    );
  });
});
