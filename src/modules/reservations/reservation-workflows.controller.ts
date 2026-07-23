import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ReservationFacade } from './services/facades/reservation.facade';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/userRole.interface';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ReservationDetailsDto } from './dto/reservation-details.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateManualReservationDto } from './dto/create-manual-reservation.dto';
import { CreateReservationTransactionDto } from '../reservation-transactions/dto/create-reservation-transaction.dto';

@Controller('reservations')
export class ReservationWorkFlowsController {
  constructor(private readonly reservationFacade: ReservationFacade) {}

  @Serialize(ReservationDetailsDto)
  @Roles(UserRole.USER)
  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationFacade.createReservationWorkflow(
      createReservationDto,
      user,
    );
  }

  @Serialize(ReservationDetailsDto)
  @Roles(UserRole.OWNER)
  @Post('owner/manual')
  async createManualReservation(
    @Body() createManualReservationDto: CreateManualReservationDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationFacade.createManualReservationWorkflow(
      createManualReservationDto,
      user,
    );
  }

  @Roles(UserRole.USER)
  @Patch('cancel/:id')
  cancel(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.reservationFacade.cancelReservationWorkflow(id, user);
  }

  @Post(':reservationId/transactions')
  @Roles(UserRole.OWNER)
  async addOnFieldTransaction(
    @Param('reservationId', new ParseUUIDPipe({ version: '4' }))
    reservationId: string,
    @Body() dto: CreateReservationTransactionDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationFacade.addOnFieldTransactionWorkflow(
      reservationId,
      dto,
      user,
    );
  }
}
