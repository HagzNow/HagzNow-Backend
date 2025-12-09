import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { WalletTransactionResponseDto } from './dto/wallet-transaction-response.dto';
import { PaymobService } from './paymob.service';
import { WalletsService } from './wallets.service';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletsService: WalletsService,
    private paymobService: PaymobService,
  ) {}
  @UseGuards(AuthGuard)
  @Get('balance')
  async getBalance(@CurrentUser() user: User) {
    return this.walletsService.getBalanceByUser(user);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.USER)
  @Post('add-funds')
  async addFunds(@Body('amount') amount: number, @CurrentUser() user: User) {
    const amountCents = amount * 100;

    const token = await this.paymobService.authenticate();
    const orderId = await this.paymobService.createOrder(
      token,
      amountCents,
      user,
    );
    const paymentToken = await this.paymobService.generatePaymentKey(
      token,
      orderId,
      amountCents,
      user.email,
    );

    const iframeUrl = this.paymobService.getIframeUrl(paymentToken);

    return { paymentUrl: iframeUrl };
  }

  @Serialize(WalletTransactionResponseDto)
  @UseGuards(AuthGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Post('withdraw')
  async withdraw(@Body('amount') amount: number, @CurrentUser() user: User) {
    return await this.walletsService.processWithdrawal(amount, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.walletsService.findOne(id);
  }
}
