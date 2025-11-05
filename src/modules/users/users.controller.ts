import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { IdParamDto } from 'src/common/dtos/id-param.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserDto } from './dto/user.dto';
import { UserRole } from './interfaces/userRole.interface';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Serialize(UserDto)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filters: UserFilterDto,
  ) {
    return this.usersService.findAll(paginationDto, filters);
  }

  @Roles(UserRole.ADMIN)
  @Get('stats')
  async getUserStats() {
    return await this.usersService.getStats();
  }

  @Serialize(UserDto)
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() { id }: User) {
    return await this.usersService.findOneById(id);
  }

  // TODO (check what to return based on the rule)
  @Serialize(UserDto)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findOneById(id);
  }

  // @Patch(':id')
  // @Serialize(UserDto)
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   let user = this.usersService.findOneById(id);
  //   if (!user) {
  //     return ApiResponseUtil.throwError(
  //       'User not found',
  //       'USER_NOT_FOUND',
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }
  //   return this.usersService.update(id, updateUserDto);
  // }

  @Roles(UserRole.ADMIN)
  @Patch('/change-status/:id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.toggle(id);
  }
}
