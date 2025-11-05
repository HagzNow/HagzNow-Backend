import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/userRole.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserFilterDto } from '../users/dto/user-filter.dto';
import { UserDto } from '../users/dto/user.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly AdminService: AdminService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.AdminService.create(createUserDto);
  }

  @Serialize(UserDto)
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filters: UserFilterDto,
  ) {
    return this.AdminService.findAll(paginationDto, filters);
  }

  @Get('user-stats')
  async getUserStats() {
    return await this.AdminService.getStats();
  }

  @Patch('/change-status/:id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.AdminService.toggle(id);
  }
}
