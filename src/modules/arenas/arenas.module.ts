import { Module } from '@nestjs/common';
import { ArenasService } from './arenas.service';
import { ArenasController } from './arenas.controller';
import { Arena } from './entities/arena.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArenaLocation } from './entities/arena-location.entity';
import { ArenaImages } from './entities/arena-image.entity';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Arena, ArenaLocation, ArenaImages]),
    CategoriesModule,
  ],
  controllers: [ArenasController],
  providers: [ArenasService],
})
export class ArenasModule {}
