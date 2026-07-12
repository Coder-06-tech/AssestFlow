const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

exports.seedDatabase = async (req, res, next) => {
  try {
    console.log('Seeding database via API...');

    // Read mockData.json
    const mockDataPath = path.join(__dirname, '../mockData.json');
    if (!fs.existsSync(mockDataPath)) {
      return res.status(404).json({
        success: false,
        message: 'mockData.json file not found in backend directory.'
      });
    }

    const rawData = fs.readFileSync(mockDataPath, 'utf8');
    const mockData = JSON.parse(rawData);

    // Clean existing data in dependency order
    await prisma.notification.deleteMany({});
    await prisma.maintenance.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.allocation.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.categoryField.deleteMany({});
    await prisma.assetCategory.deleteMany({});
    await prisma.activityLog.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.department.deleteMany({});

    console.log('Cleared database tables.');

    // 1. Seed Departments
    const createdDepts = {};
    for (const d of mockData.departments) {
      const dept = await prisma.department.create({
        data: {
          id: crypto.randomUUID(),
          name: d.name,
          status: d.status
        }
      });
      createdDepts[d.name] = dept.id;
    }

    // 2. Seed Users
    const createdUsers = {};
    for (const u of mockData.users) {
      const deptName = u.name.includes('Admin') || u.name.includes('Manager') || u.name.includes('Employee') || u.name.includes('Technician') ? 'IT Department' : 'HR Department';
      const departmentId = createdDepts[deptName] || null;

      const user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: u.name,
          email: u.email,
          password: u.passwordHash, // Maps password hash
          role: u.role,
          status: u.status,
          departmentId
        }
      });
      createdUsers[u.name] = user.id;

      // Seed mock notifications for this user
      await prisma.notification.createMany({
        data: [
          {
            id: crypto.randomUUID(),
            userId: user.id,
            message: 'New Asset Deployment: MacBook Pro 16" (M3 Max). The unit [AP-2401] has been successfully assigned to your account.',
            type: 'Alerts',
            isRead: false,
            createdAt: new Date()
          },
          {
            id: crypto.randomUUID(),
            userId: user.id,
            message: 'Critical Maintenance Required: Server Rack B-04 in London Data Center is reporting abnormal temperature fluctuations.',
            type: 'Alerts',
            isRead: false,
            createdAt: new Date(Date.now() - 45 * 60000) // 45m ago
          },
          {
            id: crypto.randomUUID(),
            userId: user.id,
            message: 'Audit Schedule Confirmed: The Q3 physical asset audit for Manhattan Hub has been scheduled for next Tuesday.',
            type: 'Approvals',
            isRead: false,
            createdAt: new Date(Date.now() - 120 * 60000) // 2h ago
          },
          {
            id: crypto.randomUUID(),
            userId: user.id,
            message: 'Booking Request Approved: Your request for 5x Oculus Quest 3 headsets for the Training Workshop on Oct 24th has been approved.',
            type: 'Bookings',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60000) // 1d ago
          },
          {
            id: crypto.randomUUID(),
            userId: user.id,
            message: 'Maintenance Log Updated: Asset [PRN-09] (Kyocera TaskAlfa) has undergone routine toner replacement and fuser cleaning.',
            type: 'Approvals',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60000) // 1d ago
          }
        ]
      });
    }

    // Assign IT department head
    if (createdUsers['Sarah Head'] && createdDepts['HR Department']) {
      await prisma.department.update({
        where: { id: createdDepts['HR Department'] },
        data: { headId: createdUsers['Sarah Head'] }
      });
    }

    // 3. Seed Asset Categories
    const createdCats = {};
    for (const c of mockData.categories) {
      const cat = await prisma.assetCategory.create({
        data: {
          id: crypto.randomUUID(),
          name: c.name
        }
      });
      createdCats[c.name] = cat.id;
    }

    // 4. Seed Assets
    const seededAssets = [];
    for (const a of mockData.assets) {
      const categoryId = createdCats[a.categoryName];
      const departmentId = createdDepts[a.departmentName] || null;

      const asset = await prisma.asset.create({
        data: {
          id: crypto.randomUUID(),
          name: a.name,
          assetTag: a.assetTag,
          status: a.status,
          categoryId,
          departmentId,
          acquisitionCost: a.acquisitionCost,
          location: a.location
        }
      });
      seededAssets.push(asset);
    }

    console.log('Seeding finished successfully.');

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully with departments, users, assets, and notifications.',
      data: {
        departmentsCount: mockData.departments.length,
        usersCount: mockData.users.length,
        categoriesCount: mockData.categories.length,
        assetsCount: seededAssets.length
      }
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    next(error);
  }
};
