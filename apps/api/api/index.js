module.exports = async (req, res) => {
  try {
    const start = Date.now();
    console.log('Hydra API: Starting', req.method, req.url);

    // First test: can we require reflect-metadata?
    console.log('Hydra API: Loading reflect-metadata');
    require('reflect-metadata');
    console.log('Hydra API: reflect-metadata loaded');

    // Try loading the NestJS handler
    console.log('Hydra API: Loading api-handler');
    let distPath;
    try {
      // Check if api/dist exists
      try {
        require('fs').accessSync('/var/task/api/dist/api-handler.js', require('fs').constants.F_OK);
        distPath = '/var/task/api/dist/api-handler';
        console.log('Hydra API: Found api/dist/api-handler.js');
      } catch {
        try {
          require('fs').accessSync('./api/dist/api-handler.js', require('fs').constants.F_OK);
          distPath = './api/dist/api-handler';
          console.log('Hydra API: Found ./api/dist/api-handler.js');
        } catch {
          try {
            require('fs').accessSync('./dist/api-handler.js', require('fs').constants.F_OK);
            distPath = './dist/api-handler';
            console.log('Hydra API: Found ./dist/api-handler.js');
          } catch {
            console.log('Hydra API: No dist file found anywhere');
            return res.status(500).json({ error: 'dist/api-handler.js not found', cwd: process.cwd(), dirs: require('fs').readdirSync('.').join(',') });
          }
        }
      }
    } catch (e) {
      console.log('Hydra API: Error checking dist:', e.message);
    }

    const mod = require(distPath);
    console.log('Hydra API: Module loaded, exports:', Object.keys(mod));
    const handler = typeof mod.default === 'function' ? mod.default : mod;
    console.log('Hydra API: Handler type:', typeof handler);

    const elapsed = Date.now() - start;
    console.log(`Hydra API: Ready in ${elapsed}ms`);

    return handler(req, res);
  } catch (err) {
    console.error('Hydra API Fatal:', err);
    res.setHeader('Content-Type', 'application/json');
    res.status(500);
    res.end(JSON.stringify({
      error: err.message,
      stack: (err.stack || '').split('\n').slice(0, 10).join('\n'),
      message: 'Hydra API handler error'
    }));
  }
};
