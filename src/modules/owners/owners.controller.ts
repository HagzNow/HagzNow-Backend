import { Controller, Get, UseGuards } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/userRole.interface';

@Controller('owner')
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Roles(UserRole.OWNER)
  @Get('dashboard')
  async getDashboardData(@CurrentUser() user: User) {
    return await this.ownersService.getDashboardData(user.id);
  }
}
