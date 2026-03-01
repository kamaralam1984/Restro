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
import { authenticate, requireStaffOrAdmin } from '../middleware/auth.middleware';
import { requireFeature } from '../middleware/featureFlag.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { validateBookingCreate } from '../middleware/validation.middleware';

const router = Router();

// Public route (for customers to create bookings)
router.post('/', validateBookingCreate, createBooking);

// Booking payment routes (public)
router.post('/payment/create', createBookingPaymentOrder);
router.post('/payment/verify', verifyBookingPayment);

// Protected: manager/admin (booking:manage) + tableBooking feature
router.get('/', authenticate, requireStaffOrAdmin, requirePermission('booking:manage'), requireFeature('tableBooking'), getBookings);
router.get('/:id', authenticate, requireStaffOrAdmin, requirePermission('booking:manage'), requireFeature('tableBooking'), getBooking);
router.put('/:id/status', authenticate, requireStaffOrAdmin, requirePermission('booking:manage'), requireFeature('tableBooking'), updateBookingStatus);
router.put('/:id/cancel', authenticate, requireStaffOrAdmin, requirePermission('booking:manage'), requireFeature('tableBooking'), cancelBooking);

export default router;

