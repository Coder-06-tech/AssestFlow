const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all notification endpoints using the authentication middleware
router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.patch('/:id/toggle', notificationController.toggleReadStatus);

module.exports = router;
