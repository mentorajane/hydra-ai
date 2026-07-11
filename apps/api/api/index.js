require('reflect-metadata');
module.exports = async (req, res) => {
  try {
    const distPath = './dist/api-handler';
    const mod = require(distPath);
    const handler = typeof mod.default === 'function' ? mod.default : mod;
    if (typeof handler !== 'function') {
      return res.status(500).json({ error: 'No handler function found', exports: Object.keys(mod) });
    }
    return handler(req, res);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: err.stack ? err.stack.split('\n').slice(0, 8).join('\n') : '',
      code: err.code
    });
  }
};
