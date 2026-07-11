require('reflect-metadata');
const serverless = require('serverless-http');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { AppModule } = require('../dist/app.module');

let cachedHandler;

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

module.exports = async function handler(req, res) {
  const app = await bootstrap();
  return app(req, res);
};
