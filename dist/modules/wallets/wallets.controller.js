"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const paymob_service_1 = require("./paymob.service");
const wallets_service_1 = require("./wallets.service");
let WalletController = class WalletController {
    walletsService;
    paymobService;
    constructor(walletsService, paymobService) {
        this.walletsService = walletsService;
        this.paymobService = paymobService;
    }
    findOne(id) {
        return this.walletsService.findOne(id);
    }
    async addFunds(amount, email) {
        const amountCents = amount * 100;
        const token = await this.paymobService.authenticate();
        const orderId = await this.paymobService.createOrder(token, amountCents);
        const paymentToken = await this.paymobService.generatePaymentKey(token, orderId, amountCents, email);
        const iframeUrl = this.paymobService.getIframeUrl(paymentToken);
        return { paymentUrl: iframeUrl };
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('add-funds'),
    __param(0, (0, common_1.Body)('amount')),
    __param(1, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "addFunds", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallets_service_1.WalletsService,
        paymob_service_1.PaymobService])
], WalletController);
//# sourceMappingURL=wallets.controller.js.map