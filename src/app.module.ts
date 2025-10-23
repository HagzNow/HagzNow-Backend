import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { databaseProviders } from './database/database.providers';
import { User } from './modules/users/entities/user.entity';
import { ArenasModule } from './modules/arenas/arenas.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { Category } from './modules/categories/entities/category.entity';
import { Arena } from './modules/arenas/entities/arena.entity';
import { ArenaImages } from './modules/arenas/entities/arena-image.entity';
import { ArenaLocation } from './modules/arenas/entities/arena-location.entity';

@Module({
  imports: [
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
        entities: [User, Category, Arena, ArenaImages, ArenaLocation],
      }),
    }),
    AuthModule,
    UsersModule,
    ArenasModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
