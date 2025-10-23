import { Module } from '@nestjs/common';
import { ArenasService } from './arenas.service';
import { ArenasController } from './arenas.controller';
import { Arena } from './entities/arena.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Arena])],
  controllers: [ArenasController],
  providers: [ArenasService],
})
export class ArenasModule {}
