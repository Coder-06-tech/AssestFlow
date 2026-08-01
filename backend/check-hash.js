const bcrypt = require('bcryptjs');

const hash = '$2a$10$mR3MKBG0.LpC3P10H3W1De8uU1M1aG5qC.o8m4kX9h1d0rGZc.vS2';
const commonPasswords = [
  'AdminPassword123',
  'UserPassword123',
  'Password123',
  'password123',
  'password',
  'admin',
  'admin123',
  'adminpassword',
  'adminPassword',
  'AdminPassword',
  'Employee123',
  'EmployeePassword',
  'AssetFlow123',
  'assetflow123',
  'assetflow',
  'Simron@2006',
  'Simron%402006',
  'simron',
  'sarita',
  'postgres',
  '123456',
  '12345678',
  '123456789',
  'qwerty',
  'Password123!',
  'password123!',
  'AssetFlow2026',
  'assetflow2026'
];

for (const pwd of commonPasswords) {
  if (bcrypt.compareSync(pwd, hash)) {
    console.log(`MATCH_FOUND: The password is "${pwd}"`);
    process.exit(0);
  }
}
console.log('No match found.');
