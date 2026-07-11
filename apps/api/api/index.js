require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { AppModule } = require('../dist/app.module');

let app;

module.exports = async (req, res) => {
  try {
    if (!app) {
      const nestApp = express();
      const nest = await NestFactory.create(AppModule, new ExpressAdapter(nestApp));
      nest.setGlobalPrefix('api/v1');
      nest.enableCors();
      await nest.init();
      app = nestApp;
    }
    // Handle request directly via Express
    app(req, res);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).end(JSON.stringify({
      error: err.message,
      stack: (err.stack || '').split('\n').slice(0, 30).join('\n')
    }));
  }
};
