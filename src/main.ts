/* eslint-disable @typescript-eslint/no-unsafe-return */
// import { webcrypto } from 'crypto';
// (global as any).crypto = webcrypto;
import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms'),
  );
  const uploadsDir =
    process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });
  const config = new DocumentBuilder()
    .setTitle('HagzNow API')
    .setDescription('API for reserving sports arenas')
    .setVersion('1.0')
    // .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true, // Allow all origins if not specified
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Language',
      'X-Correlation-ID',
    ],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // 👈 important
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
