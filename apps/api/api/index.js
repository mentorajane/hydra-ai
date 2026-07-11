let app;

module.exports = async (req, res) => {
  try {
    if (!app) {
      require('reflect-metadata');
      const { NestFactory } = require('@nestjs/core');
      const { ExpressAdapter } = require('@nestjs/platform-express');
      const express = require('express');
      const { AppModule } = require('../dist/app.module');

      const nestApp = express();
      const nest = await NestFactory.create(AppModule, new ExpressAdapter(nestApp), { logger: false });
      nest.setGlobalPrefix('api/v1');
      nest.enableCors();
      await nest.init();
      app = nestApp;
    }
    app(req, res);
  } catch (err) {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).end(JSON.stringify({
        error: err.message,
        stack: (err.stack || '').split('\n').slice(0, 30).join('\n')
      }));
    }
  }
};
