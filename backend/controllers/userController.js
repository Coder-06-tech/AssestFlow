const prisma = require('../config/db');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { department: true },
      orderBy: { id: 'asc' }
    });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};
