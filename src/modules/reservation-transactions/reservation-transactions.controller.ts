import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ReservationTransactionsService } from './reservation-transactions.service';
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

  @Patch(':id')
  @Serialize(ReservationTransactionResponseDto)
  async update(
    @Body() updateDto: UpdateReservationTransactionDto,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    return this.reservationTransactionsService.update(id, updateDto, user);
  }

  @Patch(':id/cancel')
  @Serialize(ReservationTransactionResponseDto)
  async cancel(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    return this.reservationTransactionsService.cancelByTransactionId(id, user);
  }

  @Patch(':id/settle')
  @Serialize(ReservationTransactionResponseDto)
  async settle(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    return this.reservationTransactionsService.settleOnFieldTransaction(
      id,
      user,
    );
  }
}
