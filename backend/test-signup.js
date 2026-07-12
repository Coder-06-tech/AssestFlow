const prisma = require('./utils/db');
const { hashPassword } = require('./utils/hash');

async function test() {
  try {
    const name = "Test User";
    const email = "test" + Date.now() + "@example.com";
    const password = "password123";

    console.log("Hashing password...");
    const hashedPassword = await hashPassword(password);

    console.log("Creating user...");
    const user = await prisma.user.create({
      data: {
        id: "test-user-id-" + Date.now(),
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE',
        status: 'ACTIVE'
      }
    });
    console.log("User created successfully:", user);

    console.log("Creating audit log...");
    const log = await prisma.activityLog.create({
      data: {
        id: "test-log-id-" + Date.now(),
        userId: user.id,
        action: 'USER_SIGNUP',
        module: 'ORGANIZATION',
        details: `User ${user.name} (${user.email}) registered successfully.`
      }
    });
    console.log("Audit log created successfully:", log);
  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
