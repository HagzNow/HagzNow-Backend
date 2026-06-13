import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Court } from './entities/court.entity';
import { CourtsService } from './courts.service';
import { ArenasModule } from '../arenas/arenas.module';
import { CourtsController } from './courts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Court]), forwardRef(() => ArenasModule)],
  controllers: [CourtsController],
  providers: [CourtsService],
  exports: [CourtsService],
})
export class CourtsModule {}
