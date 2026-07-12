const express = require('express');
const router = express.Router();

const orgController = require('../controllers/orgController');
const authGuard = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const validate = require('../middlewares/validate');

const {
  createDeptSchema,
  updateDeptSchema,
  createCategorySchema,
  updateCategorySchema,
  promoteEmployeeSchema,
  toggleStatusSchema
} = require('../utils/validationSchemas');

// Require auth for all routes
router.use(authGuard);

// ------------------------------------------
// DEPARTMENTS
// ------------------------------------------
// GET is public to authenticated users (e.g. for dropdown selectors)
router.get('/departments', orgController.getDepartments);
router.post('/departments', roleGuard('ADMIN'), validate(createDeptSchema), orgController.createDepartment);
router.put('/departments/:id', roleGuard('ADMIN'), validate(updateDeptSchema), orgController.updateDepartment);
router.delete('/departments/:id', roleGuard('ADMIN'), orgController.deleteDepartment);

// ------------------------------------------
// CATEGORIES
// ------------------------------------------
// GET is public to authenticated users
router.get('/categories', orgController.getCategories);
router.post('/categories', roleGuard('ADMIN'), validate(createCategorySchema), orgController.createCategory);
router.put('/categories/:id', roleGuard('ADMIN'), validate(updateCategorySchema), orgController.updateCategory);
router.delete('/categories/:id', roleGuard('ADMIN'), orgController.deleteCategory);

// ------------------------------------------
// EMPLOYEES DIRECTORY
// ------------------------------------------
// GET is public to authenticated users (e.g. for picker menus)
router.get('/employees', orgController.getEmployees);
router.patch('/employees/:id/role', roleGuard('ADMIN'), validate(promoteEmployeeSchema), orgController.promoteEmployee);
router.patch('/employees/:id/status', roleGuard('ADMIN'), validate(toggleStatusSchema), orgController.toggleEmployeeStatus);

// ------------------------------------------
// METRICS STATISTICS
// ------------------------------------------
router.get('/stats', roleGuard('ADMIN'), orgController.getStats);

module.exports = router;
