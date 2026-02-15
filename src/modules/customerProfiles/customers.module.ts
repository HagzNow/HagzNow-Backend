import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfile } from '../customerProfiles/entities/customer-profile.entity';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersListener } from './customers.listener';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerProfile]),
    AuthModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersListener],
  exports: [CustomersService],
})
export class CustomersModule {}
