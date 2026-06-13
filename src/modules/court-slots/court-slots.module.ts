import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourtSlot } from './entities/court-slot.entity';
import { CourtSlotsController } from './court-slots.controller';
import { CourtSlotsService } from './court-slots.service';
import { CourtsModule } from '../courts/courts.module';
import { ArenasModule } from '../arenas/arenas.module';
@Module({
  imports: [TypeOrmModule.forFeature([CourtSlot]), CourtsModule, ArenasModule],
  controllers: [CourtSlotsController],
  providers: [CourtSlotsService],
  exports: [CourtSlotsService],
})
export class CourtSlotsModule {}
