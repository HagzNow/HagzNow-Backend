"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const core_1 = require("@nestjs/core");
const event_emitter_1 = require("@nestjs/event-emitter");
const roles_guard_1 = require("./common/guards/roles.guard");
const arenas_module_1 = require("./modules/arenas/arenas.module");
const arena_extra_entity_1 = require("./modules/arenas/entities/arena-extra.entity");
const arena_image_entity_1 = require("./modules/arenas/entities/arena-image.entity");
const arena_location_entity_1 = require("./modules/arenas/entities/arena-location.entity");
const arena_slot_entity_1 = require("./modules/arenas/entities/arena-slot.entity");
const arena_entity_1 = require("./modules/arenas/entities/arena.entity");
const categories_module_1 = require("./modules/categories/categories.module");
const category_entity_1 = require("./modules/categories/entities/category.entity");
const reservation_entity_1 = require("./modules/reservations/entities/reservation.entity");
const reservations_module_1 = require("./modules/reservations/reservations.module");
const user_entity_1 = require("./modules/users/entities/user.entity");
const current_user_middleware_1 = require("./modules/users/middlewares/current-user.middleware");
const wallet_transaction_entity_1 = require("./modules/wallets/entities/wallet-transaction.entity");
const wallet_entity_1 = require("./modules/wallets/entities/wallet.entity");
const wallets_module_1 = require("./modules/wallets/wallets.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(current_user_middleware_1.CurrentUserMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            event_emitter_1.EventEmitterModule.forRoot(),
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: process.env.DB_HOST,
                    port: Number(process.env.DB_PORT),
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                    synchronize: process.env.DB_SYNC === 'true',
                    entities: [
                        user_entity_1.User,
                        category_entity_1.Category,
                        arena_entity_1.Arena,
                        arena_image_entity_1.ArenaImage,
                        arena_location_entity_1.ArenaLocation,
                        arena_extra_entity_1.ArenaExtra,
                        arena_slot_entity_1.ArenaSlot,
                        wallet_entity_1.Wallet,
                        wallet_transaction_entity_1.WalletTransaction,
                        reservation_entity_1.Reservation,
                    ],
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            arenas_module_1.ArenasModule,
            categories_module_1.CategoriesModule,
            wallets_module_1.WalletModule,
            reservations_module_1.ReservationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map