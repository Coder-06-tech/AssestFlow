const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script...');
  
  // Cleanup
  console.log('Cleaning up old records...');
  await prisma.activityLog.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.category.deleteMany({});

  // Hash passwords
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123';
  const commonPassword = 'UserPassword123';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const commonHash = await bcrypt.hash(commonPassword, 10);

  // 1. Create Admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@assetflow.com';
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: adminEmail,
      password: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });
  console.log(`Seeded admin user: ${admin.email}`);

  // 2. Create Departments
  console.log('Creating departments...');
  const engineering = await prisma.department.create({
    data: { name: 'Engineering', status: 'ACTIVE' }
  });
  const productDesign = await prisma.department.create({
    data: { name: 'Product Design', status: 'ACTIVE' }
  });
  const marketing = await prisma.department.create({
    data: { name: 'Marketing', status: 'ACTIVE' }
  });
  const operations = await prisma.department.create({
    data: { name: 'Operations', status: 'ACTIVE' }
  });

  // 3. Create Employees
  console.log('Creating employee directory...');
  const jane = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane.doe@assetflow.com',
      password: commonHash,
      role: 'DEPARTMENT_HEAD',
      status: 'ACTIVE',
      departmentId: productDesign.id
    }
  });

  const marcus = await prisma.user.create({
    data: {
      name: 'Marcus Chen',
      email: 'm.chen@assetflow.com',
      password: commonHash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      departmentId: engineering.id
    }
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Ross',
      email: 's.ross@assetflow.com',
      password: commonHash,
      role: 'ASSET_MANAGER',
      status: 'ACTIVE',
      departmentId: marketing.id
    }
  });

  const william = await prisma.user.create({
    data: {
      name: 'William Knight',
      email: 'w.knight@assetflow.com',
      password: commonHash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      departmentId: operations.id
    }
  });

  // Assign department heads
  await prisma.department.update({
    where: { id: productDesign.id },
    data: { headId: jane.id }
  });

  // 4. Create Categories
  console.log('Creating asset categories...');
  await prisma.category.create({
    data: {
      name: 'Laptops',
      fields: [
        { name: 'Processor', type: 'TEXT', required: true },
        { name: 'RAM (GB)', type: 'NUMBER', required: true },
        { name: 'Storage (GB)', type: 'NUMBER', required: true }
      ]
    }
  });

  await prisma.category.create({
    data: {
      name: 'Office Furniture',
      fields: [
        { name: 'Ergonomic', type: 'BOOLEAN', required: true },
        { name: 'Material', type: 'TEXT', required: false }
      ]
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
