// paymob.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymobService {
  private baseUrl = 'https://accept.paymob.com/api';
  private apiKey = process.env.PAYMOB_API_KEY;
  private integrationId = process.env.PAYMOB_INTEGRATION_ID;

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
        integration_id: Number(this.integrationId), // مهم جدًا تكون رقم
      },
    );

    return response.data.token;
  }

  getIframeUrl(paymentToken: string) {
    // Replace with your actual iframe ID from Paymob dashboard
    const iframeId = process.env.PAYMOB_IFRAME_ID;
    return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
  }
}
