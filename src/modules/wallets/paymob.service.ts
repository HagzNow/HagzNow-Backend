import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { WalletTransactionService } from './wallet-transaction.service';
import { TransactionStage } from './interfaces/transaction-stage.interface';
import { TransactionType } from './interfaces/transaction-type.interface';
import { User } from '../users/entities/user.entity';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';

@Injectable()
export class PaymobService {
  private baseUrl = 'https://accept.paymob.com/api';
  private apiKey = process.env.PAYMOB_API_KEY;
  private integrationId = process.env.PAYMOB_INTEGRATION_ID;
  private iframeId = process.env.PAYMOB_IFRAME_ID;
  private hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  constructor(private walletTransactionService: WalletTransactionService) {}

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
      return ApiResponseUtil.throwError(
        'Invalid HMAC signature',
        'INVALID_HMAC',
        400,
      );
    }
    console.log(obj);

    if (obj.success) {
      const amount = obj.amount_cents / 100;
      const referenceId = obj.order.id.toString();
      this.walletTransactionService.processCompleteTransaction(
        amount,
        referenceId,
      );
    } else {
      const referenceId = obj.order.id.toString();
      this.walletTransactionService.prcessFailedTransaction(referenceId);
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

  async createOrder(token: string, amountCents: number, user: User) {
    const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      items: [],
    });
    const newWalletTransaction = await this.walletTransactionService.create(
      {
        amount: amountCents / 100,
        stage: TransactionStage.PENDING,
        type: TransactionType.DEPOSIT,
        referenceId: response.data.id.toString(),
      },
      user,
    );
    console.log('Order created:', newWalletTransaction);
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
          userId: '5151541',
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
