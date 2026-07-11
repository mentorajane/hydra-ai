require('reflect-metadata');
module.exports = async (req, res) => {
  try {
    const mod = require('../dist/api-handler');
    const handler = typeof mod.default === 'function' ? mod.default : mod;
    if (typeof handler !== 'function') {
      return res.status(500).json({ error: 'No handler function', exports: Object.keys(mod) });
    }
    return handler(req, res);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500);
    res.end(JSON.stringify({
      error: err.message,
      stack: (err.stack || '').split('\n').slice(0, 10).join('\n')
    }));
  }
};
