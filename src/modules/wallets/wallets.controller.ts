import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { WalletsService } from './wallets.service';

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

  @Post('add-funds')
  async addFunds(@Body('amount') amount: number, @Body('email') email: string) {
    const amountCents = amount * 100;

    const token = await this.paymobService.authenticate();
    const orderId = await this.paymobService.createOrder(token, amountCents);
    const paymentToken = await this.paymobService.generatePaymentKey(
      token,
      orderId,
      amountCents,
      email,
    );

    const iframeUrl = this.paymobService.getIframeUrl(paymentToken);

    return { paymentUrl: iframeUrl };
  }
}
