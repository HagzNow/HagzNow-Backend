import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { ArenasController } from './arenas.controller';
import { ArenasService } from './arenas.service';
import { ArenaExtra } from './entities/arena-extra.entity';
import { ArenaImage } from './entities/arena-image.entity';
import { ArenaLocation } from './entities/arena-location.entity';
import { Arena } from './entities/arena.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Arena, ArenaLocation, ArenaImage, ArenaExtra]),
    CategoriesModule,
  ],
  controllers: [ArenasController],
  providers: [ArenasService],
})
export class ArenasModule {}
