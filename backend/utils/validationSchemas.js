const { z } = require('zod');

const nullableInt = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().int().nullable().optional());

// Auth validation schemas
exports.signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

exports.loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

exports.forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

exports.resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Organization Validation Schemas
exports.createDeptSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  headId: nullableInt,
  parentId: nullableInt,
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

exports.updateDeptSchema = z.object({
  name: z.string().min(1).optional(),
  headId: nullableInt,
  parentId: nullableInt,
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

exports.createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  fields: z.array(z.object({
    name: z.string().min(1, 'Field name is required'),
    type: z.enum(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN']),
    required: z.boolean()
  })).optional()
});

exports.updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  fields: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN']),
    required: z.boolean()
  })).optional()
});

exports.promoteEmployeeSchema = z.object({
  role: z.enum(['EMPLOYEE', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'])
});

exports.toggleStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'])
});

exports.createAssetSchema = z.object({
  name: z.string().trim().min(2, 'Asset name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  departmentId: z.string().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
  assetTag: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1, 'Location is required'),
  condition: z.string().trim().min(1, 'Condition is required').optional(),
  status: z.enum(['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED']).optional(),
  serialNumber: z.string().trim().optional().nullable(),
  purchaseDate: z.union([z.string(), z.date(), z.null()]).optional(),
  purchaseCost: z.union([z.number(), z.string()]).optional().nullable(),
  warrantyExpiry: z.union([z.string(), z.date(), z.null()]).optional(),
  customFields: z.record(z.any()).optional(),
  documentPaths: z.record(z.any()).optional()
});

