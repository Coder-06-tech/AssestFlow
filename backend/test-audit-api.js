const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/audit/active',
  method: 'GET',
  headers: {
    // Authenticate as System Admin
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJlbWFpbCI6ImFkbWluQGFzc2V0Zmxvdy5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODM5MjQ2MjcsImV4cCI6MTc4MzkyNTUyN30.rLvCOMKVtTfrXBNAqxykSxdfckCSvuilhoHBUakc3PE'
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
