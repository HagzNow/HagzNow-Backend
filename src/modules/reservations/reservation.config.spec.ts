import { ReservationConfig } from './reservation.config';

describe('ReservationConfig', () => {
  it('defaults the extras deposit rate to one', () => {
    const config = new ReservationConfig({
      get: jest.fn().mockReturnValue(undefined),
    } as never);

    expect(config.extrasDepositRate).toBe(1);
  });

  it.each(['invalid', '-0.01', '1.01'])(
    'rejects invalid extras deposit rate %s',
    (configuredRate) => {
      const config = new ReservationConfig({
        get: jest.fn().mockReturnValue(configuredRate),
      } as never);

      expect(() => config.extrasDepositRate).toThrow(
        'EXTRAS_DEPOSIT_RATE must be a number between 0 and 1',
      );
    },
  );
});
