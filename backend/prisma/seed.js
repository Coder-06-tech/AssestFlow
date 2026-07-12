const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script...');
  
  // Cleanup
  console.log('Cleaning up old records...');
  await prisma.activityLog.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.category.deleteMany({});

  // Hash passwords
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123';
  const commonPassword = 'UserPassword123';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const commonHash = await bcrypt.hash(commonPassword, 10);

  // 1. Create Admin
  const adminId = "admin-user-id";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@assetflow.com';
  const admin = await prisma.user.create({
    data: {
      id: adminId,
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
    data: { id: "dept-engineering", name: 'Engineering', status: 'ACTIVE' }
  });
  const productDesign = await prisma.department.create({
    data: { id: "dept-product", name: 'Product Design', status: 'ACTIVE' }
  });
  const marketing = await prisma.department.create({
    data: { id: "dept-marketing", name: 'Marketing', status: 'ACTIVE' }
  });
  const operations = await prisma.department.create({
    data: { id: "dept-operations", name: 'Operations', status: 'ACTIVE' }
  });

  // 3. Create Employees
  console.log('Creating employee directory...');
  const jane = await prisma.user.create({
    data: {
      id: "user-jane",
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
      id: "user-marcus",
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
      id: "user-sarah",
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
      id: "user-william",
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
  const laptops = await prisma.category.create({
    data: {
      id: "cat-laptops",
      name: 'Laptops',
      fields: [
        { name: 'Processor', type: 'TEXT', required: true },
        { name: 'RAM (GB)', type: 'NUMBER', required: true },
        { name: 'Storage (GB)', type: 'NUMBER', required: true }
      ],
      updatedAt: new Date()
    }
  });

  const furniture = await prisma.category.create({
    data: {
      id: "cat-furniture",
      name: 'Office Furniture',
      fields: [
        { name: 'Ergonomic', type: 'BOOLEAN', required: true },
        { name: 'Material', type: 'TEXT', required: false }
      ],
      updatedAt: new Date()
    }
  });

  // 5. Create Assets
  console.log('Creating assets...');
  const laptop1 = await prisma.asset.create({
    data: {
      id: "asset-lap1",
      name: "MacBook Pro M2",
      assetTag: "AST-LAP-001",
      categoryId: laptops.id,
      departmentId: engineering.id,
      assignedToId: marcus.id,
      location: "San Francisco Office - Desk 12",
      condition: "Excellent",
      status: "ALLOCATED",
      purchaseDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      purchaseCost: 2499.0,
      serialNumber: "SN-MBPM2-9018",
      updatedAt: new Date()
    }
  });

  const laptop2 = await prisma.asset.create({
    data: {
      id: "asset-lap2",
      name: "Dell XPS 15",
      assetTag: "AST-LAP-002",
      categoryId: laptops.id,
      departmentId: engineering.id,
      assignedToId: null,
      location: "IT Storage Room",
      condition: "Good",
      status: "AVAILABLE",
      purchaseDate: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000), // ~1.5 years ago
      purchaseCost: 1899.0,
      serialNumber: "SN-DELLXPS-1182",
      updatedAt: new Date()
    }
  });

  const laptop3 = await prisma.asset.create({
    data: {
      id: "asset-lap3",
      name: "Lenovo ThinkPad X1",
      assetTag: "AST-LAP-003",
      categoryId: laptops.id,
      departmentId: productDesign.id,
      assignedToId: jane.id,
      location: "Oakland Office - Studio A",
      condition: "Good",
      status: "ALLOCATED",
      purchaseDate: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000), // 4 years ago (nearing retirement!)
      purchaseCost: 1599.0,
      serialNumber: "SN-THINKX1-7391",
      updatedAt: new Date()
    }
  });

  const chair1 = await prisma.asset.create({
    data: {
      id: "asset-chr1",
      name: "Herman Miller Aeron Chair",
      assetTag: "AST-FURN-001",
      categoryId: furniture.id,
      departmentId: marketing.id,
      assignedToId: sarah.id,
      location: "San Francisco Office - Marketing Row",
      condition: "Excellent",
      status: "ALLOCATED",
      purchaseDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
      purchaseCost: 1200.0,
      serialNumber: "SN-AERON-3392",
      updatedAt: new Date()
    }
  });

  const chair2 = await prisma.asset.create({
    data: {
      id: "asset-chr2",
      name: "Steelcase Gesture Chair",
      assetTag: "AST-FURN-002",
      categoryId: furniture.id,
      departmentId: operations.id,
      assignedToId: null,
      location: "Oakland Storage",
      condition: "Fair",
      status: "AVAILABLE",
      purchaseDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000), // 2 years ago
      purchaseCost: 950.0,
      serialNumber: "SN-STEEL-1928",
      updatedAt: new Date()
    }
  });

  const idleAsset = await prisma.asset.create({
    data: {
      id: "asset-idle1",
      name: "iPad Pro 12.9",
      assetTag: "AST-LAP-004",
      categoryId: laptops.id,
      departmentId: marketing.id,
      assignedToId: null,
      location: "Marketing Cabinet B",
      condition: "Excellent",
      status: "AVAILABLE",
      purchaseDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
      purchaseCost: 1099.0,
      serialNumber: "SN-IPAD-0301",
      updatedAt: new Date()
    }
  });

  // 6. Create Allocations (Utilization)
  console.log('Creating allocations...');
  await prisma.allocation.create({
    data: {
      id: "alloc-1",
      assetId: laptop1.id,
      userId: marcus.id,
      allocatedById: admin.id,
      allocatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
      status: "ACTIVE",
      notes: "Standard engineering laptop issuance.",
      updatedAt: new Date()
    }
  });

  await prisma.allocation.create({
    data: {
      id: "alloc-2",
      assetId: laptop3.id,
      userId: jane.id,
      allocatedById: admin.id,
      allocatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      notes: "Design lead computer.",
      updatedAt: new Date()
    }
  });

  await prisma.allocation.create({
    data: {
      id: "alloc-3",
      assetId: chair1.id,
      userId: sarah.id,
      allocatedById: admin.id,
      allocatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      status: "ACTIVE",
      notes: "Ergonomic workspace allocation.",
      updatedAt: new Date()
    }
  });

  // Past allocation that was returned
  await prisma.allocation.create({
    data: {
      id: "alloc-4",
      assetId: laptop2.id,
      userId: william.id,
      allocatedById: admin.id,
      allocatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      returnedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      status: "RETURNED",
      notes: "Temporary project loan.",
      updatedAt: new Date()
    }
  });

  // 7. Create Bookings (Heatmap & Most Used)
  console.log('Creating resource bookings...');
  const peakHours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  const offPeakHours = ["08:00", "12:00", "13:00", "17:00", "18:00"];
  
  let bookingIdIndex = 1;
  const generateBooking = async (resourceName, assetId, userId, dateOffset, timeStr) => {
    await prisma.booking.create({
      data: {
        id: `booking-${bookingIdIndex++}`,
        resourceName,
        date: new Date(Date.now() - dateOffset * 24 * 60 * 60 * 1000),
        startTime: timeStr,
        endTime: parseInt(timeStr.split(":")[0]) + 1 + ":00",
        userId,
        status: "COMPLETED",
        updatedAt: new Date()
      }
    });
  };

  // Seed bookings spread out to create visual heatmap hot-spots
  for (let i = 1; i <= 20; i++) {
    const dayOffset = (i * 3) % 15;
    const time = peakHours[i % peakHours.length];
    await generateBooking("Conference Room A", laptop2.id, marcus.id, dayOffset, time);
    await generateBooking("Projector Room B2", laptop2.id, jane.id, dayOffset + 1, time);
  }

  for (let i = 1; i <= 10; i++) {
    const dayOffset = (i * 2) % 15;
    const time = offPeakHours[i % offPeakHours.length];
    await generateBooking("Conference Room A", laptop2.id, william.id, dayOffset, time);
  }

  // 8. Create Maintenance Requests
  console.log('Creating maintenance requests...');
  await prisma.maintenance.create({
    data: {
      id: "maint-1",
      assetId: laptop1.id,
      raisedById: marcus.id,
      priority: "MEDIUM",
      status: "RESOLVED",
      description: "Screen flickering issue.",
      notes: "Replaced display connector cable.",
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      updatedAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.maintenance.create({
    data: {
      id: "maint-2",
      assetId: laptop3.id,
      raisedById: jane.id,
      priority: "HIGH",
      status: "PENDING", // Pending action for nearing retirement asset
      description: "Battery overheating.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date()
    }
  });

  await prisma.maintenance.create({
    data: {
      id: "maint-3",
      assetId: chair2.id,
      raisedById: william.id,
      priority: "LOW",
      status: "ASSIGNED",
      description: "Height adjustment lock stuck.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date()
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
