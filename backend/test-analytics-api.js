const http = require('http');

const endpoints = [
  '/api/analytics/utilization',
  '/api/analytics/maintenance-frequency',
  '/api/analytics/most-used',
  '/api/analytics/idle',
  '/api/analytics/maintenance-due',
  '/api/analytics/allocation-summary',
  '/api/analytics/booking-heatmap'
];

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJlbWFpbCI6ImFkbWluQGFzc2V0Zmxvdy5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3ODM5MjQ2MjcsImV4cCI6MTc4MzkyNTUyN30.rLvCOMKVtTfrXBNAqxykSxdfckCSvuilhoHBUakc3PE'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ path, statusCode: res.statusCode, success: res.statusCode === 200 });
      });
    });

    req.on('error', (e) => {
      resolve({ path, statusCode: 500, success: false, error: e.message });
    });

    req.end();
  });
}

async function main() {
  console.log('=== Testing Analytics API Endpoints ===\n');
  for (const endpoint of endpoints) {
    const res = await testEndpoint(endpoint);
    if (res.success) {
      console.log(`✅ [GET] ${res.path} - Success (Status: 200)`);
    } else {
      console.log(`❌ [GET] ${res.path} - Failed (Status: ${res.statusCode})`);
    }
  }
}

main();
