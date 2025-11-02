import { Body, Controller, Post, Query } from '@nestjs/common';
import { PaymobService } from './paymob.service';

@Controller('paymob')
export class PaymobWebhookController {
  constructor(private readonly paymobService: PaymobService) {}

  @Post('webhook')
  handleWebhook(@Body() payload: any, @Query('hmac') hmac: string) {
    return this.paymobService.handleWebhook(payload, hmac);
  }
}
