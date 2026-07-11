async function bootstrap() {
  require('reflect-metadata');
  const serverless = require('serverless-http');
  const express = require('express');
  
  // Minimal Express app - no NestJS
  const app = express();
  app.get('*', (req, res) => res.json({ msg: 'Express works', path: req.url }));
  
  return serverless(app);
}

module.exports = async (req, res) => {
  try {
    const handler = await bootstrap();
    return handler(req, res);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).end(JSON.stringify({
      error: err.message,
      stack: (err.stack || '').split('\n').slice(0, 30).join('\n')
    }));
  }
};
