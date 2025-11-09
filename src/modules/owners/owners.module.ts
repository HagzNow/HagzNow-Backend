import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArenasModule } from '../arenas/arenas.module';
import { Arena } from '../arenas/entities/arena.entity';
import { User } from '../users/entities/user.entity';
import { OwnersController } from './owners.controller';
import { OwnersService } from './owners.service';

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
