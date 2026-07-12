const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', allocationController.getAllocations);
router.get('/activity', allocationController.getActivityLogs);
router.post('/', allocationController.createAllocation);
router.post('/:id/return', allocationController.returnAllocation);

module.exports = router;
