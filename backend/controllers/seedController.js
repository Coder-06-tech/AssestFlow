const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

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
    await prisma.maintenanceRequest.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.allocation.deleteMany({});
    await prisma.asset.deleteMany({});
    await prisma.categoryField.deleteMany({});
    await prisma.assetCategory.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.department.deleteMany({});

    console.log('Cleared database tables.');

    // 1. Seed Departments
    const createdDepts = {};
    for (const d of mockData.departments) {
      const dept = await prisma.department.create({
        data: {
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
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
          status: u.status,
          departmentId
        }
      });
      createdUsers[u.name] = user.id;
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
      message: 'Database seeded successfully with departments, users, and assets.',
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
