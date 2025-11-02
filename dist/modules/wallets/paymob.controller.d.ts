export declare class PaymobWebhookController {
    private readonly hmacSecret;
    handleWebhook(payload: any, hmac: string): {
        received: boolean;
    };
}
