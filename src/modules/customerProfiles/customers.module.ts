import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfile } from '../customerProfiles/entities/customer-profile.entity';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersListener } from './customers.listener';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerProfile])],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersListener],
  exports: [CustomersService],
})
export class CustomersModule {}
