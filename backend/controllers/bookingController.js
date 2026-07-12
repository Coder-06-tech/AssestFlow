const prisma = require('../config/db');
const crypto = require('crypto');

// Get all bookings (optionally filter by resource name or user)
exports.getBookings = async (req, res, next) => {
  try {
    const { resourceName, userId } = req.query;
    const filter = {};

    if (resourceName) filter.resourceName = resourceName;
    if (userId) filter.userId = userId;

    const bookings = await prisma.booking.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// Create a new booking with overlap validation
exports.createBooking = async (req, res, next) => {
  try {
    const { resourceName, date, startTime, endTime } = req.body;
    const userId = req.user.id; // From authMiddleware (String UUID)

    if (!resourceName || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'resourceName, date, startTime, and endTime are required'
      });
    }

    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Basic time format validation (expecting HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'startTime and endTime must be in HH:MM format (24-hour)'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check overlaps
    // Formula: Two bookings on the same resource and date overlap if A < D and B > C
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        resourceName,
        date: bookingDate,
        status: {
          not: 'CANCELLED'
        },
        startTime: {
          lt: endTime
        },
        endTime: {
          gt: startTime
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (overlappingBooking) {
      return res.status(409).json({
        success: false,
        message: `Time slot conflict: This resource is already booked by ${overlappingBooking.user.name} from ${overlappingBooking.startTime} to ${overlappingBooking.endTime}.`
      });
    }

    // Create booking (generate UUID)
    const booking = await prisma.booking.create({
      data: {
        id: crypto.randomUUID(),
        resourceName,
        date: bookingDate,
        startTime,
        endTime,
        userId: userId,
        status: 'UPCOMING',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    next(error);
  }
};

// Update booking status (cancel, complete, ongoing)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const bookingId = req.params.id; // String UUID
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status field is required'
      });
    }

    const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions: Only the creator of the booking or ASSET_MANAGER/ADMIN can cancel/modify
    if (booking.userId !== userId && !['ADMIN', 'ASSET_MANAGER'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this booking'
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a cancelled booking'
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking
    });

  } catch (error) {
    next(error);
  }
};
