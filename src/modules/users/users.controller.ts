import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UseImageUpload } from 'src/common/decorators/use-image-upload.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

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
  @UseImageUpload([{ name: 'avatar', maxCount: 1 }])
  async updateProfile(
    @Body() userData: UpdateUserDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
    },
    @CurrentUser() { id }: User,
  ) {
    return await this.usersService.update(id, userData, files);
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
