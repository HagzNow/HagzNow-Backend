import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ReservationSummaryDto } from './dto/reservation-summary.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(
      createReservationDto,
      'e0b4ca5f-0578-4e93-a82f-b7396f9cde29',
    );
  }

  @Serialize(ReservationSummaryDto)
  @UseGuards(AuthGuard)
  @Get('past')
  findPastReservations(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.findPastReservations(paginationDto, user);
  }

  @Serialize(ReservationSummaryDto)
  @UseGuards(AuthGuard)
  @Get('upcoming')
  findUpcomingReservations(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.findUpcomingReservations(
      paginationDto,
      user,
    );
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
