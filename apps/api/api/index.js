module.exports = async (req, res) => {
  try {
    const fs = require('fs');
    const cwd = process.cwd();
    const dirs = fs.readdirSync(cwd).filter(d => !d.startsWith('.'));
    const distExists = fs.existsSync('dist');
    const distApiExists = fs.existsSync('api/dist');

    // Try to find api-handler
    const searchPaths = [
      '../dist/api-handler',
      './dist/api-handler',
      'dist/api-handler',
      '/var/task/dist/api-handler',
      '/var/task/api/dist/api-handler'
    ];
    const found = searchPaths.filter(p => { try { require.resolve(p); return true } catch { return false } });

    res.status(200).json({
      cwd,
      dirs,
      files: dirs.filter(d => fs.statSync(d).isFile()).map(f => ({ name: f, size: fs.statSync(f).size })),
      subdirs: dirs.filter(d => fs.statSync(d).isDirectory()),
      distExists,
      distApiExists,
      foundPaths: found,
      pwd: process.cwd(),
      lambdaRoot: process.env.LAMBDA_TASK_ROOT || 'none'
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: (err.stack || '').split('\n').slice(0,5).join('\n') });
  }
};
