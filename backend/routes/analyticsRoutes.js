const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const authGuard = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');

// Require authentication and manager/admin roles for analytics reports
router.use(authGuard);
router.use(roleGuard('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'));

router.get('/utilization', analyticsController.getUtilizationByDept);
router.get('/maintenance-frequency', analyticsController.getMaintenanceFrequency);
router.get('/most-used', analyticsController.getMostUsedAssets);
router.get('/idle', analyticsController.getIdleAssets);
router.get('/maintenance-due', analyticsController.getMaintenanceDueOrRetiring);
router.get('/allocation-summary', analyticsController.getAllocationSummary);
router.get('/booking-heatmap', analyticsController.getBookingHeatmap);

module.exports = router;
