require('reflect-metadata');
const handler = require('./dist/api-handler').default;
console.log('Handler type:', typeof handler);
const req = { method: 'GET', url: '/api/v1/auth/me', headers: {} };
const res = {
  status(c) { console.log('Status:', c); return this; },
  json(d) { console.log('JSON:', JSON.stringify(d)); return this; },
  end(c) { console.log('End:', c?.substring?.(0, 200) || c); return this; },
  setHeader() { return this; },
  getHeaders() { return {}; }
};
handler(req, res)
  .then(() => console.log('Done'))
  .catch(err => console.error('Error:', err));
