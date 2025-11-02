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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_entity_1 = require("../users/entities/user.entity");
const wallets_service_1 = require("./wallets.service");
let WalletsListener = class WalletsListener {
    walletsService;
    constructor(walletsService) {
        this.walletsService = walletsService;
    }
    handleUserCreated(user) {
        this.walletsService.create(user);
    }
};
exports.WalletsListener = WalletsListener;
__decorate([
    (0, event_emitter_1.OnEvent)('user.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], WalletsListener.prototype, "handleUserCreated", null);
exports.WalletsListener = WalletsListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wallets_service_1.WalletsService])
], WalletsListener);
//# sourceMappingURL=wallets.listener.js.map