import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UploadModule } from '../upload/upload.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    forwardRef(() => UploadModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRESIN', '1h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule], // ✅ Export it for others to reuse
})
export class AuthModule {}
