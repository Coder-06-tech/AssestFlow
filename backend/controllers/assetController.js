const prisma = require('../config/db');

exports.getAssets = async (req, res, next) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: true,
        department: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        assetTag: 'asc'
      }
    });
    res.status(200).json({
      success: true,
      data: assets
    });
  } catch (error) {
    next(error);
  }
};
