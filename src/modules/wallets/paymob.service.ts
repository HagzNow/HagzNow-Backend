import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymobService {
  private baseUrl = 'https://accept.paymob.com/api';
  private apiKey = process.env.PAYMOB_API_KEY;
  private integrationId = process.env.PAYMOB_INTEGRATION_ID;
  private iframeId = process.env.PAYMOB_IFRAME_ID;
  private hmacSecret = process.env.PAYMOB_HMAC_SECRET;

  // -----------------------------
  // 🧩 Webhook handler
  // -----------------------------
  handleWebhook(payload: any, hmac: string) {
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
      // You can trigger post-payment logic here
    }

    return { received: true };
  }

  // -----------------------------
  // 🧩 Payment flow methods
  // -----------------------------
  async authenticate() {
    const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
      api_key: this.apiKey,
    });
    return response.data.token;
  }

  async createOrder(token: string, amountCents: number) {
    const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      items: [],
    });
    return response.data.id;
  }

  async generatePaymentKey(
    token: string,
    orderId: number,
    amountCents: number,
    email: string,
  ) {
    const response = await axios.post(
      `${this.baseUrl}/acceptance/payment_keys`,
      {
        auth_token: token,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: 'NA',
          email,
          floor: 'NA',
          first_name: 'Mohamed',
          last_name: 'Hisham',
          street: 'NA',
          building: 'NA',
          phone_number: '+201000000000',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'Cairo',
          country: 'EG',
          state: 'NA',
        },
        currency: 'EGP',
        integration_id: Number(this.integrationId),
      },
    );

    return response.data.token;
  }

  getIframeUrl(paymentToken: string) {
    return `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentToken}`;
  }
}
