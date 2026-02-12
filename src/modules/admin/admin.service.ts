import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { UserStatus } from '../users/interfaces/userStatus.interface';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { UsersService } from '../users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class AdminService extends UsersService {
  constructor(
    eventEmitter: EventEmitter2,
    @InjectRepository(User) userRepository: Repository<User>,
    uploadService: UploadService,
  ) {
    super(eventEmitter, userRepository, uploadService);
  }
  async getStats() {
    const totalUsers = await this.userRepository.count();

    const totalOwners = await this.userRepository.count({
      where: { role: UserRole.OWNER },
    });

    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });

    return {
      totalUsers,
      totalOwners,
      activeUsers,
    };
  }

  async toggle(id: string): Promise<User | never> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return ApiResponseUtil.throwError(
        'User not found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    user.status =
      user.status == UserStatus.DISABLED
        ? UserStatus.ACTIVE
        : UserStatus.DISABLED;
    return await this.userRepository.save(user);
  }
}
