import { Body, Controller, Patch, Post, Param } from '@nestjs/common';
import { ReservationTransactionsService } from './reservation-transactions.service';
import { CreateReservationTransactionDto } from './dto/create-reservation-transaction.dto';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/userRole.interface';
import { UpdateReservationTransactionDto } from './dto/update-reservation-transaction.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ReservationTransactionResponseDto } from './dto/reservation-transactions-response.dto';

@Roles(UserRole.OWNER)
@Controller('reservation-transactions')
export class ReservationTransactionsController {
  constructor(
    private readonly reservationTransactionsService: ReservationTransactionsService,
  ) {}

  @Post('manual')
  @Serialize(ReservationTransactionResponseDto)
  async createManualForOwner(
    @Body() createReservationTransactionDto: CreateReservationTransactionDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationTransactionsService.createManualForOwner(
      createReservationTransactionDto,
      user,
    );
  }

  @Patch(':id')
  @Serialize(ReservationTransactionResponseDto)
  async update(
    @Body() updateDto: UpdateReservationTransactionDto,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.reservationTransactionsService.update(id, updateDto, user);
  }

  @Patch(':id/cancel')
  @Serialize(ReservationTransactionResponseDto)
  async cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reservationTransactionsService.cancel(id, user);
  }
}
