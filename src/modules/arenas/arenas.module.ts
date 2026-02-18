import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { UploadModule } from '../upload/upload.module';
import { AuthModule } from '../auth/auth.module';
import { ArenasController } from './arenas.controller';
import { ArenasService } from './arenas.service';
import { ArenaImage } from './entities/arena-image.entity';
import { ArenaLocation } from './entities/arena-location.entity';
import { Arena } from './entities/arena.entity';
import { CourtsModule } from '../courts/courts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Arena, ArenaLocation, ArenaImage]),
    CategoriesModule,
    UploadModule,
    forwardRef(() => CourtsModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [ArenasController],
  providers: [ArenasService],
  exports: [ArenasService],
})
export class ArenasModule {}
