import 'reflect-metadata';
import serverless from 'serverless-http';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';

let cachedHandler: ReturnType<typeof serverless>;

async function bootstrap() {
  if (!cachedHandler) {
    const app = express();
    const nest = await NestFactory.create(AppModule, new ExpressAdapter(app));
    nest.setGlobalPrefix('api/v1');
    nest.enableCors();
    await nest.init();
    cachedHandler = serverless(app);
  }
  return cachedHandler;
}

export default async (req: any, res: any) => {
  try {
    const handler = await bootstrap();
    return handler(req, res);
  } catch (err: any) {
    console.error('Hydra Error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};
