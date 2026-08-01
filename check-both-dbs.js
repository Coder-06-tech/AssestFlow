const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

const localUrl = "postgresql://postgres:Simron%402006@localhost:5432/assestflow?schema=public";

// Load backend .env for Neon URL
dotenv.config({ path: path.join(__dirname, 'backend/.env'), override: true });
const neonUrl = process.env.DATABASE_URL;

console.log("Local DB URL:", localUrl);
console.log("Neon DB URL:", neonUrl);

async function checkDb(url, dbName) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    console.log(`[${dbName}] Users count:`, users.length);
    console.log(`[${dbName}] Users:`, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error(`[${dbName}] Error:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await checkDb(localUrl, "LOCAL");
  await checkDb(neonUrl, "NEON");
}

main();
