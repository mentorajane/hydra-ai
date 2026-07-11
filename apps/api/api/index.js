module.exports = async (req, res) => {
  try {
    const mod = require('../dist/api-handler');
    const handler = typeof mod.default === 'function' ? mod.default : mod;
    if (typeof handler !== 'function') {
      return res.status(500).json({ error: 'No handler function', exports: Object.keys(mod) });
    }
    const start = Date.now();
    console.log('Hydra: calling NestJS handler');
    const result = await handler(req, res);
    console.log('Hydra: NestJS handler completed in', Date.now() - start, 'ms');
    return result;
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500);
    res.end(JSON.stringify({
      error: err.message,
      stack: (err.stack || '').split('\n').slice(0, 15).join('\n')
    }));
  }
};
