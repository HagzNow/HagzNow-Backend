import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from './interfaces/userRole.interface';
import { OwnerDto } from './dto/owner.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { IsPhoneNumber } from 'class-validator';
import { UpdatePhoneDto } from './dto/update-phone.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Serialize(UserDto)
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() { id }: User) {
    return await this.usersService.findOneById(id);
  }

  @Serialize(UserDto)
  @UseGuards(AuthGuard)
  @Patch('profile')
  async updateProfile(
    @Body() userData: UpdateUserDto,
    @CurrentUser() { id }: User,
  ) {
    return await this.usersService.update(id, userData);
  }

  @Serialize(UserDto)
  @UseGuards(AuthGuard)
  @Patch('profile/phone')
  async updatePhone(
    @Body() updatePhoneDto: UpdatePhoneDto,
    @CurrentUser() { id }: User,
  ) {
    return await this.usersService.updatePhone(id, updatePhoneDto.phone);
  }

  @Serialize(OwnerDto)
  @Roles(UserRole.ADMIN)
  @Get('owner-requests')
  async getOwnerRequests(@Query() PaginationDto: PaginationDto) {
    return await this.usersService.findOwnerRequests(PaginationDto);
  }

  @Serialize(OwnerDto)
  @Roles(UserRole.ADMIN)
  @Patch('owner-requests/:id/accept')
  async acceptOwnerRequest(@Param('id') id: string) {
    return await this.usersService.acceptOwnerRequest(id);
  }

  @Serialize(OwnerDto)
  @Roles(UserRole.ADMIN)
  @Patch('owner-requests/:id/reject')
  async rejectOwnerRequest(@Param('id') id: string) {
    return await this.usersService.rejectOwnerRequest(id);
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
}
