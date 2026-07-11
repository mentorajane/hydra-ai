let cachedHandler;

async function bootstrap() {
  if (!cachedHandler) {
    require('reflect-metadata');
    const serverless = require('serverless-http');
    const { NestFactory } = require('@nestjs/core');
    const { ExpressAdapter } = require('@nestjs/platform-express');
    const express = require('express');
    const { AppModule } = require('../dist/app.module');

    const app = express();
    const nest = await NestFactory.create(AppModule, new ExpressAdapter(app));
    nest.setGlobalPrefix('api/v1');
    nest.enableCors();
    await nest.init();
    cachedHandler = serverless(app);
  }
  return cachedHandler;
}

module.exports = async (req, res) => {
  try {
    const handler = await bootstrap();
    return handler(req, res);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500);
    res.end(JSON.stringify({
      error: err.message,
      stack: (err.stack || '').split('\n').slice(0, 30).join('\n')
    }));
  }
};
