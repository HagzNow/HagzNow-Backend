import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { OwnersController } from './owners.controller';
import { OwnersService } from './owners.service';
import { ArenasModule } from '../arenas/arenas.module';
import { Arena } from '../arenas/entities/arena.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Arena]),
    forwardRef(() => ArenasModule),
  ],
  controllers: [OwnersController],
  providers: [OwnersService],
  exports: [OwnersService],
})
export class OwnersModule {}
