import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseDatePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationCalenderCardDto } from './dto/reservation-calender-card.dto';
import { ReservationDetailsDto } from './dto/reservation-details.dto';
import { ReservationFilterDto } from './dto/reservation-filter.dto';
import { ReservationSummaryDto } from './dto/reservation-summary.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './services/reservations.service';
import { CreateManualReservationDto } from './dto/create-manual-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Serialize(ReservationDetailsDto)
  @Roles(UserRole.USER)
  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.create(createReservationDto, user);
  }
  @Serialize(ReservationDetailsDto)
  @Roles(UserRole.OWNER)
  @Post('owner/manual')
  createManualReservation(
    @Body() createManualReservationDto: CreateManualReservationDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.createManualReservation(
      createManualReservationDto,
      user,
    );
  }

  @Serialize(ReservationSummaryDto)
  @Roles(UserRole.USER)
  @Get('past')
  findPastReservations(
    @Query() paginationDto: PaginationDto,
    @Query() filters: ReservationFilterDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.findPastReservations(
      paginationDto,
      filters,
      user,
    );
  }

  @Serialize(ReservationSummaryDto)
  @Roles(UserRole.USER)
  @Get('upcoming')
  findUpcomingReservations(
    @Query() paginationDto: PaginationDto,
    @Query() filters: ReservationFilterDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.findUpcomingReservations(
      paginationDto,
      filters,
      user,
    );
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

  @Serialize(ReservationDetailsDto)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Roles(UserRole.USER)
  @Patch('cancel/:id')
  cancel(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.reservationsService.cancelReservation(id, user);
  }
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.reservationsService.remove(id);
  }
}
