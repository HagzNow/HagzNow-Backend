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
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

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
    @CurrentUser() user: User,
  ) {
    return await this.usersService.updatePhone(user, updatePhoneDto.newPhone);
  }

  @Serialize(UserDto)
  @UseGuards(AuthGuard)
  @Patch('profile/language')
  async updateLanguage(
    @Body() { newLanguage }: UpdateLanguageDto,
    @CurrentUser() user: User,
  ) {
    return await this.usersService.updateLanguage(user, newLanguage);
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
}
