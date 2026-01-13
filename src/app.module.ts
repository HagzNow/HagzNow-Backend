import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
// import { databaseProviders } from './database/database.providers';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        // entities: [__dirname + '/../**/*.entity{.ts,.js}'],

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
          Review,
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
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
