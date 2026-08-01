const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = [
    { name: 'User', query: () => prisma.user.findMany({ take: 5 }) },
    { name: 'Department', query: () => prisma.department.findMany({ take: 5 }) },
    { name: 'PasswordResetToken', query: () => prisma.passwordResetToken.findMany({ take: 5 }) },
    { name: 'Category', query: () => prisma.category.findMany({ take: 5 }) },
    { name: 'Asset', query: () => prisma.asset.findMany({ take: 5 }) },
    { name: 'Allocation', query: () => prisma.allocation.findMany({ take: 5 }) },
    { name: 'Booking', query: () => prisma.booking.findMany({ take: 5 }) },
    { name: 'ActivityLog', query: () => prisma.activityLog.findMany({ take: 5 }) },
    { name: 'Audit', query: () => prisma.audit.findMany({ take: 5 }) },
    { name: 'AuditAsset', query: () => prisma.auditAsset.findMany({ take: 5 }) },
    { name: 'Maintenance', query: () => prisma.maintenance.findMany({ take: 5 }) },
    { name: 'Notification', query: () => prisma.notification.findMany({ take: 5 }) },
    { name: 'Transfer', query: () => prisma.transfer.findMany({ take: 5 }) }
  ];

  console.log('=== Checking Database Tables ===\n');

  for (const model of models) {
    try {
      const records = await model.query();
      console.log(`✅ Table [${model.name}]: Connected successfully. (Found ${records.length} sample/seeded records)`);
    } catch (err) {
      console.error(`❌ Table [${model.name}]: Failed to query. Error: ${err.message}`);
    }
  }

  await prisma.$disconnect();
}

main();
