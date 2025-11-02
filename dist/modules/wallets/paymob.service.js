"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymobService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let PaymobService = class PaymobService {
    baseUrl = 'https://accept.paymob.com/api';
    apiKey = process.env.PAYMOB_API_KEY;
    integrationId = process.env.PAYMOB_INTEGRATION_ID;
    async authenticate() {
        const response = await axios_1.default.post(`${this.baseUrl}/auth/tokens`, {
            api_key: this.apiKey,
        });
        return response.data.token;
    }
    async createOrder(token, amountCents) {
        const response = await axios_1.default.post(`${this.baseUrl}/ecommerce/orders`, {
            auth_token: token,
            delivery_needed: false,
            amount_cents: amountCents,
            currency: 'EGP',
            items: [],
        });
        return response.data.id;
    }
    async generatePaymentKey(token, orderId, amountCents, email) {
        const response = await axios_1.default.post(`${this.baseUrl}/acceptance/payment_keys`, {
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
        });
        return response.data.token;
    }
    getIframeUrl(paymentToken) {
        const iframeId = process.env.PAYMOB_IFRAME_ID;
        return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
    }
};
exports.PaymobService = PaymobService;
exports.PaymobService = PaymobService = __decorate([
    (0, common_1.Injectable)()
], PaymobService);
//# sourceMappingURL=paymob.service.js.map