import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ArenasService } from './arenas.service';
import { CreateArenaDto } from './dto/create-arena.dto';
import { UpdateArenaDto } from './dto/update-arena.dto';

@Controller('arenas')
export class ArenasController {
  constructor(private readonly arenasService: ArenasService) {}

  @Post()
  create(@Body() createArenaDto: CreateArenaDto) {
    return this.arenasService.create(createArenaDto);
  }

  @Get()
  findAll() {
    return this.arenasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arenasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArenaDto: UpdateArenaDto) {
    return this.arenasService.update(+id, updateArenaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.arenasService.remove(+id);
  }
}
