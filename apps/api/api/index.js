let app;
let initError;

module.exports = async (req, res) => {
  try {
    if (!app && !initError) {
      try {
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
      } catch (e) {
        initError = e;
        throw e;
      }
    }

    if (!app) {
      return res.status(500).end(JSON.stringify({ error: 'Init failed', message: initError?.message, stack: initError?.stack }));
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
