module.exports = async (req, res) => {
  try {
    const steps = [];
    try { require('reflect-metadata'); steps.push('reflect-metadata') } catch(e) { steps.push('reflect FAIL:'+e.message) }
    try { require('express'); steps.push('express') } catch(e) { steps.push('express FAIL:'+e.message) }
    try { require('serverless-http'); steps.push('serverless-http') } catch(e) { steps.push('serverless FAIL:'+e.message) }
    try { require('@nestjs/core'); steps.push('@nestjs/core') } catch(e) { steps.push('@nestjs/core FAIL:'+e.message) }
    try { require('@nestjs/platform-express'); steps.push('@nestjs/platform-express') } catch(e) { steps.push('@nestjs/platform-express FAIL:'+e.message) }
    try { require('../dist/app.module'); steps.push('app.module') } catch(e) { steps.push('app.module FAIL:'+e.message) }
    
    res.status(200).json({ steps, dirs: require('fs').readdirSync('.').filter(d => !d.startsWith('.')) });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).end(JSON.stringify({ error: err.message, stack: (err.stack||'').split('\n').slice(0,10).join('\n') }));
  }
};
