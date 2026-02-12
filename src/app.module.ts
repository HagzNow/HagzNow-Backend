import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RolesGuard } from './common/guards/roles.guard';
import { AdminModule } from './modules/admin/admin.module';
import { ArenasModule } from './modules/arenas/arenas.module';
import { ArenaExtra } from './modules/arenas/entities/arena-extra.entity';
import { ArenaImage } from './modules/arenas/entities/arena-image.entity';
import { ArenaLocation } from './modules/arenas/entities/arena-location.entity';
import { ArenaSlot } from './modules/arenas/entities/arena-slot.entity';
import { Arena } from './modules/arenas/entities/arena.entity';
import { CategoriesModule } from './modules/categories/categories.module';
import { Category } from './modules/categories/entities/category.entity';
import { OwnersModule } from './modules/owners/owners.module';
import { Reservation } from './modules/reservations/entities/reservation.entity';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { Review } from './modules/reviews/entities/review.entity';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { User } from './modules/users/entities/user.entity';
import { CurrentUserMiddleware } from './modules/users/middlewares/current-user.middleware';
import { WalletTransaction } from './modules/wallets/entities/wallet-transaction.entity';
import { Wallet } from './modules/wallets/entities/wallet.entity';
import { WalletModule } from './modules/wallets/wallets.module';
import { CustomerProfile } from './modules/customerProfiles/entities/customer-profile.entity';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import path from 'path';
import { UserLanguageResolver } from './common/resolvers/user-language.resolver';
import { Language } from './common/enums/language.enum';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ReservationExtra } from './modules/reservations/entities/reservation-extra.entity';
import { ReservationExtrasModule } from './modules/reservation-extras/reservation-extras.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: Language.ar,
      loaderOptions: {
        path: path.join(process.cwd(), 'dist', 'src', 'common', 'i18n'),
        watch: true,
      },
      resolvers: [
        UserLanguageResolver, // Priority 1: Stored preference
        new HeaderResolver(['x-language']), // Priority 2: Header (for unauthenticated)
      ],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,

        // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.

        synchronize: process.env.DB_SYNC === 'true',
        entities: [
          User,
          Category,
          Arena,
          ArenaImage,
          ArenaLocation,
          ArenaExtra,
          ArenaSlot,
          Wallet,
          WalletTransaction,
          Reservation,
          ReservationExtra,
          Review,
          CustomerProfile,
        ],
      }),
    }),
    AuthModule,
    UsersModule,
    OwnersModule,
    AdminModule,
    ArenasModule,
    CategoriesModule,
    WalletModule,
    ReservationsModule,
    ReservationExtrasModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserLanguageResolver,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
