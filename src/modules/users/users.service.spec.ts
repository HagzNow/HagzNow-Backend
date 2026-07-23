import { UserRole } from './interfaces/userRole.interface';
import { UserStatus } from './interfaces/userStatus.interface';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const userRepository = {
    exist: jest.fn(),
  };
  const service = new UsersService(
    {} as never,
    userRepository as never,
    {} as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checks active admin status using the user repository', async () => {
    userRepository.exist.mockResolvedValue(true);

    await expect(service.isActiveAdmin('admin-id')).resolves.toBe(true);
    expect(userRepository.exist).toHaveBeenCalledWith({
      where: {
        id: 'admin-id',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
  });

  it('returns false without querying when the user id is missing', async () => {
    await expect(service.isActiveAdmin('')).resolves.toBe(false);
    expect(userRepository.exist).not.toHaveBeenCalled();
  });
});
