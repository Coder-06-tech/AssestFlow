const prisma = require('../config/db');
const crypto = require('crypto');

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

exports.createAsset = async (req, res, next) => {
  try {
    const {
      name,
      assetTag,
      categoryId,
      departmentId,
      assignedToId,
      location,
      condition,
      status,
      serialNumber,
      purchaseDate,
      purchaseCost,
      warrantyExpiry,
      imagePath,
      documentPaths
    } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Asset Name and Category are required.'
      });
    }

    // Verify tag ID uniqueness if provided
    if (assetTag) {
      const existing = await prisma.asset.findUnique({
        where: { assetTag }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Asset with Tag ID ${assetTag} already exists.`
        });
      }
    }

    const newAsset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        name,
        assetTag: assetTag || `AF-${Math.floor(1000 + Math.random() * 9000)}`,
        categoryId,
        departmentId: departmentId || null,
        assignedToId: assignedToId || null,
        location: location || 'HQ Room 101',
        condition: condition || 'Good',
        status: status || 'AVAILABLE',
        serialNumber: serialNumber || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        imagePath: imagePath || null,
        documentPaths: documentPaths || null
      },
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
      }
    });

    res.status(201).json({
      success: true,
      message: 'Asset registered successfully',
      data: newAsset
    });
  } catch (error) {
    next(error);
  }
};
