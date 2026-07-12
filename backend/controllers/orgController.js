const prisma = require('../utils/db');
const { randomUUID } = require('crypto');

// Helper for circular department hierarchy checks
const detectCycle = async (deptId, targetParentId) => {
  if (!targetParentId) return false;
  if (deptId === targetParentId) return true;

  let currentParentId = targetParentId;
  while (currentParentId) {
    const parentDept = await prisma.department.findUnique({
      where: { id: currentParentId },
      select: { parentId: true }
    });
    if (!parentDept) break;
    if (parentDept.parentId === deptId) return true;
    currentParentId = parentDept.parentId;
  }
  return false;
};

// ==========================================
// DEPARTMENTS CONTROLLERS
// ==========================================

exports.getDepartments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      where.status = status;
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        head: {
          select: { id: true, name: true, email: true }
        },
        parent: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, headId, parentId, status } = req.body;

    const existing = await prisma.department.findFirst({ where: { name } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'A department with this name already exists.'
      });
    }

    const department = await prisma.department.create({
      data: {
        id: randomUUID(),
        name,
        headId: headId || null,
        parentId: parentId || null,
        status: status || 'ACTIVE'
      },
      include: {
        head: { select: { id: true, name: true, email: true } },
        parent: { select: { id: true, name: true } }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, headId, parentId, status } = req.body;

    const current = await prisma.department.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ success: false, error: 'Department not found.' });
    }

    // Name collision check
    if (name && name !== current.name) {
      const existing = await prisma.department.findFirst({ where: { name } });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'A department with this name already exists.'
        });
      }
    }

    // Cycle detection check
    if (parentId && parentId !== current.parentId) {
      const isCircular = await detectCycle(id, parentId);
      if (isCircular) {
        return res.status(400).json({
          success: false,
          error: 'Circular dependency detected. A department cannot be a child of its own descendants.'
        });
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: name !== undefined ? name : current.name,
        headId: headId !== undefined ? (headId || null) : current.headId,
        parentId: parentId !== undefined ? (parentId || null) : current.parentId,
        status: status !== undefined ? status : current.status
      },
      include: {
        head: { select: { id: true, name: true, email: true } },
        parent: { select: { id: true, name: true } }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft-delete: set status to INACTIVE
    const current = await prisma.department.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ success: false, error: 'Department not found.' });
    }

    await prisma.department.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });

    return res.status(200).json({
      success: true,
      message: 'Department deactivated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ASSET CATEGORY CONTROLLERS
// ==========================================

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, fields } = req.body;

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'A category with this name already exists.'
      });
    }

    const category = await prisma.category.create({
      data: {
        id: randomUUID(),
        name,
        fields: fields || []
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, fields } = req.body;

    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    // Name collision
    if (name && name !== current.name) {
      const existing = await prisma.category.findUnique({ where: { name } });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'A category with this name already exists.'
        });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : current.name,
        fields: fields !== undefined ? fields : current.fields
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const current = await prisma.category.findUnique({
      where: { id },
      include: { assets: { select: { id: true } } }
    });

    if (!current) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }

    // Check references to prevent breaking relationships
    if (current.assets && current.assets.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category. There are registered assets referencing it.'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EMPLOYEES DIRECTORY CONTROLLERS
// ==========================================

exports.getEmployees = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      where.status = status;
    }

    const employees = await prisma.user.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } }
      },
      orderBy: { name: 'asc' }
    });

    // Remove hashed password from user response
    const employeesWithoutPassword = employees.map(emp => {
      const { password, ...empWithoutPass } = emp;
      return empWithoutPass;
    });

    return res.status(200).json({
      success: true,
      data: employeesWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

exports.promoteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // e.g. EMPLOYEE, ASSET_MANAGER, DEPARTMENT_HEAD

    if (role === 'ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Admin privilege cannot be assigned from this directory panel.'
      });
    }

    const currentEmployee = await prisma.user.findUnique({ where: { id } });
    if (!currentEmployee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    if (currentEmployee.role === 'ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Administrators cannot be demoted or promoted from this screen.'
      });
    }

    const updatedEmployee = await prisma.user.update({
      where: { id },
      data: { role },
      include: { department: { select: { id: true, name: true } } }
    });

    // Write Activity Log entry
    await prisma.activityLog.create({
      data: {
        id: randomUUID(),
        userId: req.user.id, // ID of Admin who triggered this
        action: 'ROLE_PROMOTION',
        module: 'ORGANIZATION',
        details: `Role for ${currentEmployee.name} (${currentEmployee.email}) changed from ${currentEmployee.role} to ${role}.`
      }
    });

    const { password, ...employeeWithoutPassword } = updatedEmployee;

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully.',
      data: employeeWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // ACTIVE or INACTIVE

    const currentEmployee = await prisma.user.findUnique({ where: { id } });
    if (!currentEmployee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    if (currentEmployee.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot deactivate your own administrator account.'
      });
    }

    const updatedEmployee = await prisma.user.update({
      where: { id },
      data: { status },
      include: { department: { select: { id: true, name: true } } }
    });

    // Write Activity Log entry
    await prisma.activityLog.create({
      data: {
        id: randomUUID(),
        userId: req.user.id,
        action: 'USER_STATUS_TOGGLE',
        module: 'ORGANIZATION',
        details: `Account status for ${currentEmployee.name} (${currentEmployee.email}) set to ${status}.`
      }
    });

    const { password, ...employeeWithoutPassword } = updatedEmployee;

    return res.status(200).json({
      success: true,
      message: `User status changed to ${status.toLowerCase()} successfully.`,
      data: employeeWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// METRICS STATISTICS CONTROLLER
// ==========================================

exports.getStats = async (req, res, next) => {
  try {
    const totalEmployees = await prisma.user.count();
    const departmentsCount = await prisma.department.count();
    const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } });

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        departmentsCount,
        adminUsers
      }
    });
  } catch (error) {
    next(error);
  }
};
