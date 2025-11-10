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
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserFilterDto } from '../users/dto/user-filter.dto';
import { UserDto } from '../users/dto/user.dto';
import { UserRole } from '../users/interfaces/userRole.interface';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly AdminService: AdminService) {}

  @Post('users')
  create(@Body() createUserDto: CreateUserDto) {
    return this.AdminService.create(createUserDto);
  }

  @Serialize(UserDto)
  @Get('users')
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filters: UserFilterDto,
  ) {
    return this.AdminService.findAll(paginationDto, filters);
  }

  @Get('users/stats')
  async getUserStats() {
    return await this.AdminService.getStats();
  }

  @Serialize(UserDto)
  @Get('users/:id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.AdminService.findOneById(id);
  }

  @Patch('users/:id/status')
  toggleStatus(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.AdminService.toggle(id);
  }
}
