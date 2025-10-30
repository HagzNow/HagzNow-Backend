import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
} from '@nestjs/common';
import * as crypto from 'crypto';

@Controller('paymob')
export class PaymobWebhookController {
  private readonly hmacSecret = process.env.PAYMOB_HMAC_SECRET;

  @Post('webhook')
  handleWebhook(@Body() payload: any, @Query('hmac') hmac: string) {
    const obj = payload.obj;

    const dataToHash = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order?.id,
      obj.owner,
      obj.pending,
      obj.source_data?.pan,
      obj.source_data?.sub_type,
      obj.source_data?.type,
      obj.success,
    ]
      .map((v) => (v ?? '').toString())
      .join('');

    const calculatedHmac = crypto
      .createHmac('sha512', this.hmacSecret || '')
      .update(dataToHash)
      .digest('hex');

    if (calculatedHmac !== hmac) {
      throw new BadRequestException('Invalid HMAC');
    }

    if (obj.success) {
      const amount = obj.amount_cents / 100;
      const email = obj.payment_key_claims.billing_data.email;
      console.log('✅ Payment succeeded:', { amount, email });
      //   console.log(JSON.stringify(payload, null, 2));
    }

    return { received: true };
  }
}
