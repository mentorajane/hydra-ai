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
      nestApp.use(express.json());
      const nest = await NestFactory.create(AppModule, new ExpressAdapter(nestApp), { logger: false });
      nest.setGlobalPrefix('api/v1');
      nest.enableCors();
      await nest.init();
      app = nestApp;
    }

    app(req, res);
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
};
