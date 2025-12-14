import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserDto } from '../users/dto/user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateOwnerDto } from '../users/dto/create-owner.dto';
import { UseImageUpload } from 'src/common/decorators/use-image-upload.decorator';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }
  @Post('register')
  signUp(@Body() signUpDto: CreateUserDto) {
    return this.authService.signUpUser(signUpDto);
  }

  @Post('register/owner')
  @UseImageUpload([
    { name: 'nationalIdFront', maxCount: 1 },
    { name: 'nationalIdBack', maxCount: 1 },
    { name: 'selfieWithId', maxCount: 1 },
  ])
  signUpOwner(
    @Body() signUpDto: CreateOwnerDto,
    @UploadedFiles()
    files: {
      nationalIdFront?: Express.Multer.File[];
      nationalIdBack?: Express.Multer.File[];
      selfieWithId?: Express.Multer.File[];
    },
  ) {
    if (
      !files ||
      !files.nationalIdFront ||
      !files.nationalIdBack ||
      !files.selfieWithId
    ) {
      return ApiResponseUtil.throwError(
        'All identity verification images are required',
        'MISSING_ID_IMAGES',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.authService.signUpOwner(signUpDto, files);
  }

  @Serialize(UserDto)
  @UseGuards(AuthGuard)
  @Patch('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    return await this.authService.setNewPassword(
      user,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
