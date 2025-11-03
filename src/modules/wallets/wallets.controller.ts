import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { WalletsService } from './wallets.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from '../users/entities/user.entity';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletsService: WalletsService,
    private paymobService: PaymobService,
  ) {}
  @UseGuards(AuthGuard)
  @Get('balance')
  async getBalance(@CurrentUser() user: User) {
    console.log('Getting balance for user:', user.id);
    return this.walletsService.getBalanceByUserId(user.id);
  }

  @UseGuards(AuthGuard)
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.walletsService.findOne(id);
  }
}
