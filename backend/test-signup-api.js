const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userData = JSON.stringify({
  name: 'Test Account',
  email: `test-${Date.now()}@example.com`,
  password: 'Password123',
  designation: 'Engineer'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': userData.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', async () => {
    console.log('Signup Status Code:', res.statusCode);
    console.log('Signup Response:', body);
    
    // Now check the DB to see if the user was inserted
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true }
      });
      console.log('Users in DB after signup:', JSON.stringify(users, null, 2));
    } catch (err) {
      console.error('Error querying DB:', err);
    } finally {
      await prisma.$disconnect();
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(userData);
req.end();
