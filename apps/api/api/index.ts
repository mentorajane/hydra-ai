import 'reflect-metadata';
import serverless from 'serverless-http';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedHandler: ReturnType<typeof serverless>;

async function bootstrap() {
  if (!cachedHandler) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    nestApp.setGlobalPrefix('api/v1');
    nestApp.enableCors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE' });
    await nestApp.init();
    cachedHandler = serverless(expressApp);
  }
  return cachedHandler;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  return app(req, res);
}
