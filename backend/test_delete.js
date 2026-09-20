const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/messages/single/6',
  method: 'DELETE',
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
