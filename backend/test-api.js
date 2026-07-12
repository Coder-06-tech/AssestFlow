const prisma = require('./utils/db');

async function test() {
  try {
    console.log("Testing database query on Department...");
    const depts = await prisma.department.findMany();
    console.log("Departments successfully queried:", depts.length);

    console.log("Testing database query on Category...");
    const cats = await prisma.category.findMany();
    console.log("Categories successfully queried:", cats.length);

    console.log("Testing database query on User...");
    const users = await prisma.user.findMany();
    console.log("Users successfully queried:", users.length);

    console.log("Testing database query on ActivityLog...");
    const logs = await prisma.activityLog.findMany();
    console.log("Logs successfully queried:", logs.length);

  } catch (error) {
    console.error("API test failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
