import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/booking.controller';
import {
  createBookingPaymentOrder,
  verifyBookingPayment,
} from '../controllers/bookingPayment.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateBookingCreate } from '../middleware/validation.middleware';

const router = Router();

// Public route (for customers to create bookings)
router.post('/', validateBookingCreate, createBooking);

// Booking payment routes (public)
router.post('/payment/create', createBookingPaymentOrder);
router.post('/payment/verify', verifyBookingPayment);

// Protected admin routes
router.get('/', authenticate, requireAdmin, getBookings);
router.get('/:id', authenticate, requireAdmin, getBooking);
router.put('/:id/status', authenticate, requireAdmin, updateBookingStatus);
router.put('/:id/cancel', authenticate, requireAdmin, cancelBooking);

export default router;

