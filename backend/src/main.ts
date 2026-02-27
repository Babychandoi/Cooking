import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/exception/filter/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor.js';
import { DataSource } from 'typeorm';
import { seed } from './database/seed.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // API prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors();

  // Seed data
  const dataSource = app.get(DataSource);
  await seed(dataSource);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 8080;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
