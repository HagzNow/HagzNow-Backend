// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/require-await */
// import { ConfigService } from '@nestjs/config';
// import { DataSource } from 'typeorm';

// export const databaseProviders = [
//   {
//     inject: [ConfigService],
//     useFactory: (config: ConfigService) => ({
//       type: 'postgres',
//       host: process.env.DB_HOST,
//       port: Number(process.env.DB_PORT),
//       username: process.env.DB_USERNAME,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       entities: [__dirname + '/../**/*.entity{.ts,.js}'],

//       // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.

//       synchronize: process.env.DB_SYNC === 'true',
//     }),
//   },
// ];
