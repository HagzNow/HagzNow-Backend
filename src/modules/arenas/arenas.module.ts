import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { UploadModule } from '../upload/upload.module';
import { ArenaSlotsController } from './arena-slots.controller';
import { ArenaSlotsService } from './arena-slots.service';
import { ArenasController } from './arenas.controller';
import { ArenasService } from './arenas.service';
import { ArenaExtra } from './entities/arena-extra.entity';
import { ArenaImage } from './entities/arena-image.entity';
import { ArenaLocation } from './entities/arena-location.entity';
import { ArenaSlot } from './entities/arena-slot.entity';
import { Arena } from './entities/arena.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Arena,
      ArenaLocation,
      ArenaImage,
      ArenaExtra,
      ArenaSlot,
    ]),
    CategoriesModule,
    UploadModule,
  ],
  controllers: [ArenasController, ArenaSlotsController],
  providers: [ArenasService, ArenaSlotsService],
  exports: [ArenasService, ArenaSlotsService],
})
export class ArenasModule {}
