module.exports = async (req, res) => {
  try {
    const fs = require('fs');
    const cwd = process.cwd();
    const dirs = fs.readdirSync(cwd).filter(d => !d.startsWith('.'));
    const distExists = fs.existsSync('dist');
    const distFiles = distExists ? fs.readdirSync('dist').filter(d => !d.startsWith('.')) : [];

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
      distExists,
      distFiles,
      foundPaths: found,
      lambdaRoot: process.env.LAMBDA_TASK_ROOT || 'none'
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: (err.stack || '').split('\n').slice(0,8).join('\n') });
  }
};
