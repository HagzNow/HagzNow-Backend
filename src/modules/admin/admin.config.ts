import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminConfig {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  get adminId(): string {
    const id = this.config.get('ADMIN_ID');
    if (!id) {
      return ApiResponseUtil.throwError(
        'errors.general.admin_not_found',
        'ADMIN_USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return id;
  }
  get adminFeeRate(): number {
    let rate = Number(this.config.get('ADMIN_FEE_RATE'));
    if (isNaN(rate) || rate < 0 || rate > 1) {
      return ApiResponseUtil.throwError(
        'errors.general.invalid_admin_fee_rate',
        'INVALID_ADMIN_FEE_RATE',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return rate;
  }
  async getAdminUser(): Promise<User> {
    const id = this.adminId;
    const admin = await this.usersService.findOneById(id);
    return admin;
  }
  // Inside your AdminConfig class, add this getter:
  get modificationBufferHours(): number {
    const buffer = Number(this.config.get('MODIFICATION_BUFFER_HOURS'));
    // If not configured or invalid, default to 2 hours
    if (isNaN(buffer) || buffer < 0) {
      return 2;
    }
    return buffer;
  }
}
