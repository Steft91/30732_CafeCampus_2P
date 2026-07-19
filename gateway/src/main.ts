import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { initSentry } from './observability/sentry';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';

async function bootstrap() {
  initSentry('gateway');

  const app = await NestFactory.create(AppModule);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Validación automática de DTOs en todos los endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true,
      transform: true,       // convierte tipos automáticamente
    }),
  );

  // CORS para el frontend Angular
  app.useGlobalFilters(new SentryExceptionFilter());

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Gateway corriendo en http://localhost:${port}/api`);
}

bootstrap();
