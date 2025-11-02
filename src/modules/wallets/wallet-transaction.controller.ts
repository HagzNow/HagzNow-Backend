import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WalletTransactionService } from './wallet-transaction.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('transactions')
export class WalletTransactionController {
  constructor(
    private readonly walletTransactionService: WalletTransactionService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: User,
  ) {
    return await this.walletTransactionService.findAll(paginationDto, user);
  }
}
