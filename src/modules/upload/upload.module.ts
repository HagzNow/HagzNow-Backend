import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ConditionalAuthGuard } from './guards/conditional-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    ConfigModule,
    JwtModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, ConditionalAuthGuard],
  exports: [UploadService],
})
export class UploadModule {}

