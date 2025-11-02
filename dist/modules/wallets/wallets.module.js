"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const wallet_transaction_entity_1 = require("./entities/wallet-transaction.entity");
const wallet_entity_1 = require("./entities/wallet.entity");
const paymob_controller_1 = require("./paymob.controller");
const paymob_service_1 = require("./paymob.service");
const wallets_controller_1 = require("./wallets.controller");
const wallets_listener_1 = require("./wallets.listener");
const wallets_service_1 = require("./wallets.service");
let WalletModule = class WalletModule {
};
exports.WalletModule = WalletModule;
exports.WalletModule = WalletModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([wallet_entity_1.Wallet, wallet_transaction_entity_1.WalletTransaction])],
        controllers: [wallets_controller_1.WalletController, paymob_controller_1.PaymobWebhookController],
        providers: [wallets_service_1.WalletsService, wallets_listener_1.WalletsListener, paymob_service_1.PaymobService],
    })
], WalletModule);
//# sourceMappingURL=wallets.module.js.map