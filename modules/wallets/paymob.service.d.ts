export declare class PaymobService {
    private baseUrl;
    private apiKey;
    private integrationId;
    authenticate(): Promise<any>;
    createOrder(token: string, amountCents: number): Promise<any>;
    generatePaymentKey(token: string, orderId: number, amountCents: number, email: string): Promise<any>;
    getIframeUrl(paymentToken: string): string;
}
