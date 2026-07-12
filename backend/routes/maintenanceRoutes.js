const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware); // Protect all maintenance routes

router.get('/', maintenanceController.getMaintenanceRequests);
router.post('/', maintenanceController.raiseRequest);
router.put('/:id/status', maintenanceController.updateRequestStatus);

module.exports = router;
