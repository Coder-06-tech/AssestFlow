const prisma = require('../utils/db');
const crypto = require('crypto');

// Get all notifications for logged-in user
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// Mark all user notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id },
      data: { isRead: true }
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle read status of a single notification
exports.toggleReadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find notification first
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found.'
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to notification.'
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: !notification.isRead }
    });

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
