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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { User } from '../users/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationDetailsDto } from './dto/reservation-details.dto';
import { ReservationSummaryDto } from './dto/reservation-summary.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Serialize(ReservationDetailsDto)
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.create(createReservationDto, user.id);
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
