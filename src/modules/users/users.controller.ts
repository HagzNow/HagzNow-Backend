import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { ApiResponseUtil } from '../../common/utils/api-response.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO (add admin guard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // TODO (add admin guard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // TODO (check what to return based on the rule)
  @Get(':id')
  findOne(@Param('id') id: string) {
    let user = this.usersService.findOneById(id);
    if (!user) {
      return ApiResponseUtil.throwError(
        'User not found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  @Patch(':id')
  @Serialize(UserDto)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    let user = this.usersService.findOneById(id);
    if (!user) {
      return ApiResponseUtil.throwError(
        'User not found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
