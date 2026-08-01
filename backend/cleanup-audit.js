const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.audit.deleteMany({
    where: { status: 'PENDING' }
  });
  console.log('Cleanup results:', result);
  await prisma.$disconnect();
}

main();
