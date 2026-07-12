const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware); // Protect all booking routes

router.get('/', bookingController.getBookings);
router.post('/', bookingController.createBooking);
router.put('/:id/status', bookingController.updateBookingStatus);

module.exports = router;
