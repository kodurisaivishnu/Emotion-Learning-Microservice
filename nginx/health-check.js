// Health check script for monitoring
const http = require('http');

const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

const options = {
  hostname: HOST,
  port: PORT,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Health check passed');
      console.log('Response:', data);
      process.exit(0);
    } else {
      console.error('❌ Health check failed');
      console.error('Status Code:', res.statusCode);
      console.error('Response:', data);
      process.exit(1);
    }
  });
});

req.on('timeout', () => {
  console.error('❌ Health check timeout');
  req.destroy();
  process.exit(1);
});

req.on('error', (err) => {
  console.error('❌ Health check error:', err.message);
  process.exit(1);
});

req.end();
