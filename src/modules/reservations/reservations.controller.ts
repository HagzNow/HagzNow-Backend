import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationDetailsDto } from './dto/reservation-details.dto';
import { ReservationSummaryDto } from './dto/reservation-summary.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

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
    return this.reservationsService.create(createReservationDto, user.id);
  }

  @Serialize(ReservationSummaryDto)
  @Roles(UserRole.USER)
  @Get('past')
  findPastReservations(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.findPastReservations(paginationDto, user);
  }

  @Serialize(ReservationSummaryDto)
  @Roles(UserRole.USER)
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

  @Serialize(ReservationDetailsDto)
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

  @Roles(UserRole.USER)
  @Patch('cancel/:id')
  cancel(@Param('id') id: string) {
    return this.reservationsService.cancelReservation(id);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
