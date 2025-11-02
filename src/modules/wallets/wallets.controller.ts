import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { WalletsService } from './wallets.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletsService: WalletsService,
    private paymobService: PaymobService,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.walletsService.findOne(id);
  }
  @UseGuards(AuthGuard)
  @Post('add-funds')
  async addFunds(@Body('amount') amount: number, @CurrentUser() user: any) {
    const amountCents = amount * 100;

    const token = await this.paymobService.authenticate();
    const orderId = await this.paymobService.createOrder(token, amountCents);
    const paymentToken = await this.paymobService.generatePaymentKey(
      token,
      orderId,
      amountCents,
      user.email,
    );

    const iframeUrl = this.paymobService.getIframeUrl(paymentToken);

    return { paymentUrl: iframeUrl };
  }
}
