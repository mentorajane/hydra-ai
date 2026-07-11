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
      nestApp.use(express.urlencoded({ extended: true }));
      const nest = await NestFactory.create(AppModule, new ExpressAdapter(nestApp), { logger: false });
      nest.setGlobalPrefix('api/v1');
      nest.enableCors();
      await nest.init();
      app = nestApp;
    }

    await new Promise((resolve, reject) => {
      res.on('finish', resolve);
      res.on('error', reject);
      try {
        app(req, res);
      } catch (e) {
        reject(e);
      }
    });
  } catch (err) {
    try {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message, stack: (err.stack||'').split('\n').slice(0,20).join('\n') }));
      }
    } catch(e) { /* ignore */ }
  }
};
