import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { CourtDto } from './dto/court.dto';
import { CourtQueryDto } from './dto/court-query.dto';

@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Serialize(CourtDto)
  @Roles(UserRole.OWNER)
  @Post('arena/:arenaId')
  create(
    @Param('arenaId', new ParseUUIDPipe({ version: '4' })) arenaId: string,
    @Body() createCourtDto: CreateCourtDto,
    @CurrentUser() owner: User,
  ) {
    return this.courtsService.create(createCourtDto, arenaId, owner);
  }

  @Serialize(CourtDto)
  @Get('arena/:arenaId')
  findByArena(
    @Param('arenaId', new ParseUUIDPipe({ version: '4' })) arenaId: string,
    @Query() courtQueryDto: CourtQueryDto,
  ) {
    return this.courtsService.findByArena(arenaId, courtQueryDto.status);
  }

  @Serialize(CourtDto)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.courtsService.findOne(id);
  }

  @Serialize(CourtDto)
  @Roles(UserRole.OWNER)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateCourtDto: UpdateCourtDto,
    @CurrentUser() owner: User,
  ) {
    return this.courtsService.update(id, updateCourtDto, owner);
  }

  @Roles(UserRole.OWNER)
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() owner: User,
  ) {
    return this.courtsService.remove(id, owner);
  }
}
