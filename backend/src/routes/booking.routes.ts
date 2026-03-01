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
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import { validateBookingCreate } from '../middleware/validation.middleware';

const router = Router();

// Public route (for customers to create bookings)
router.post('/', validateBookingCreate, createBooking);

// Booking payment routes (public)
router.post('/payment/create', createBookingPaymentOrder);
router.post('/payment/verify', verifyBookingPayment);

// Protected admin routes
router.get('/', authenticate, requireAdminOrSuperAdmin, getBookings);
router.get('/:id', authenticate, requireAdminOrSuperAdmin, getBooking);
router.put('/:id/status', authenticate, requireAdminOrSuperAdmin, updateBookingStatus);
router.put('/:id/cancel', authenticate, requireAdminOrSuperAdmin, cancelBooking);

export default router;

