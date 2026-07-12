const prisma = require('../config/db');
const crypto = require('crypto');

const normalizeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const generateAssetTag = async () => {
  const assets = await prisma.asset.findMany({
    select: { assetTag: true },
    orderBy: { createdAt: 'desc' }
  });

  const matches = assets
    .map((asset) => asset.assetTag)
    .map((tag) => tag?.match(/^(?:AF[-\s]?)(\d+)$/i))
    .filter(Boolean)
    .map((match) => Number(match[1]));

  const highest = matches.length > 0 ? Math.max(...matches) : 0;
  return `AF-${String(highest + 1).padStart(4, '0')}`;
};

const validateCategoryFields = async (categoryId, customFields = {}) => {
  if (!categoryId) return null;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, fields: true }
  });

  if (!category) {
    throw new Error('Category not found.');
  }

  const definitions = Array.isArray(category.fields) ? category.fields : [];
  const errors = [];

  definitions.forEach((field) => {
    const fieldName = field?.name;
    const value = customFields?.[fieldName];
    const expectsRequired = Boolean(field?.required);

    if (expectsRequired && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName}: is required`);
      return;
    }

    if (value === undefined || value === null || value === '') {
      return;
    }

    switch (field?.type) {
      case 'NUMBER':
        if (Number.isNaN(Number(value))) {
          errors.push(`${fieldName}: must be numeric`);
        }
        break;
      case 'BOOLEAN':
        if (typeof value !== 'boolean') {
          errors.push(`${fieldName}: must be a boolean`);
        }
        break;
      case 'DATE':
        if (Number.isNaN(new Date(value).getTime())) {
          errors.push(`${fieldName}: must be a valid date`);
        }
        break;
      case 'TEXT':
      default:
        if (typeof value !== 'string') {
          errors.push(`${fieldName}: must be text`);
        }
        break;
    }
  });

  if (errors.length > 0) {
    const error = new Error(errors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  return definitions;
};

exports.getAssets = async (req, res, next) => {
  try {
    const {
      q,
      status,
      categoryId,
      departmentId,
      condition,
      assignedToId,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { assetTag: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { serialNumber: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (departmentId) where.departmentId = departmentId;
    if (condition) where.condition = condition;
    if (assignedToId) where.assignedToId = assignedToId;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    const assets = await prisma.asset.findMany({
      where,
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
        [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: assets,
      count: assets.length
    });
  } catch (error) {
    next(error);
  }
};

exports.createAsset = async (req, res, next) => {
  try {
    const payload = req.body || {};

    const categoryId = payload.categoryId;
    if (!payload.name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Asset Name and Category are required.'
      });
    }

    const normalizedCustomFields = payload.customFields || {};
    await validateCategoryFields(categoryId, normalizedCustomFields);

    const assetTag = payload.assetTag || (await generateAssetTag());
    
    // Check assetTag uniqueness
    const existing = await prisma.asset.findUnique({
      where: { assetTag }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Asset with Tag ID ${assetTag} already exists.`
      });
    }

    const data = {
      id: crypto.randomUUID(),
      name: payload.name?.trim(),
      assetTag,
      categoryId,
      departmentId: payload.departmentId || null,
      assignedToId: payload.assignedToId || null,
      location: payload.location?.trim() || 'Main Office',
      condition: payload.condition?.trim() || 'Good',
      status: payload.status || 'AVAILABLE',
      serialNumber: payload.serialNumber?.trim() || null,
      purchaseDate: normalizeDate(payload.purchaseDate),
      purchaseCost: payload.purchaseCost !== undefined && payload.purchaseCost !== '' ? Number(payload.purchaseCost) : null,
      warrantyExpiry: normalizeDate(payload.warrantyExpiry),
      documentPaths: payload.documentPaths || (normalizedCustomFields ? { customFields: normalizedCustomFields } : null)
    };

    const created = await prisma.asset.create({
      data,
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

    return res.status(201).json({
      success: true,
      message: 'Asset registered successfully.',
      data: created
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'An asset with this tag already exists.'
      });
    }

    if (error?.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    next(error);
  }
};

exports.getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({
      where: { id },
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

    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found.' });
    }

    return res.status(200).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};
