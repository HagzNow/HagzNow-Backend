import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArenaExtra } from './entities/arena-extra.entity';
import { ArenaExtrasService } from './arena-extras.service';
import { ArenaExtrasController } from './arena-extras.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArenaExtra])],
  controllers: [ArenaExtrasController],
  providers: [ArenaExtrasService],
  exports: [ArenaExtrasService],
})
export class ArenaExtrasModule {}
