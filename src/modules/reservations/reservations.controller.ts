import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseDatePipe,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { ReservationCalenderCardDto } from './dto/reservation-calender-card.dto';
import { ReservationDetailsDto } from './dto/reservation-details.dto';
import { ReservationFilterDto } from './dto/reservation-filter.dto';
import { ReservationSummaryDto } from './dto/reservation-summary.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './services/reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Serialize(ReservationSummaryDto)
  @Roles(UserRole.USER)
  @Get('past')
  findPastReservations(
    @Query() filters: ReservationFilterDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.findPastReservations(filters, user);
  }

  @Serialize(ReservationSummaryDto)
  @Roles(UserRole.USER)
  @Get('upcoming')
  findUpcomingReservations(
    @Query() filters: ReservationFilterDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.findUpcomingReservations(filters, user);
  }

  @Serialize(ReservationCalenderCardDto)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Get()
  async getReservationsByFilters(
    @Query('arenaId', new ParseUUIDPipe({ version: '4' })) arenaId: string,
    @Query('startDate', new ParseDatePipe()) startDate: Date,
    @Query('endDate', new ParseDatePipe()) endDate: Date,
    @Query() filters: ReservationFilterDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.findReservationsByDateRange(
      arenaId,
      user,
      startDate,
      endDate,
      filters,
    );
  }

  @Serialize(ReservationCalenderCardDto)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Get('arena/:arenaId')
  async getLiveReservations(
    @Param('arenaId', new ParseUUIDPipe({ version: '4' })) arenaId: string,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.findLiveReservationsForArena(arenaId, user);
  }

  @Serialize(ReservationDetailsDto)
  @Roles(UserRole.USER, UserRole.OWNER, UserRole.ADMIN)
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.findDetails(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.reservationsService.remove(id);
  }
}
