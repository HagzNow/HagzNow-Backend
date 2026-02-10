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
  async getAdminUser(): Promise<User> {
    const id = this.adminId;
    const admin = await this.usersService.findOneById(id);
    return admin;
  }
}
