import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminConfig } from './admin.config';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule, UploadModule],
  controllers: [AdminController],
  providers: [AdminService, AdminConfig],
  exports: [AdminService, AdminConfig],
})
export class AdminModule {}
