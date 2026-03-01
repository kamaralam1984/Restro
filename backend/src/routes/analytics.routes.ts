import { Router } from 'express';
import {
  getDashboardStats,
  getOrdersPerHour,
  getTopSellingItems,
  getRevenueSummary,
  getRepeatCustomers,
  getBookingStats,
} from '../controllers/analytics.controller';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// All analytics routes require authentication — admin or super_admin
router.use(authenticate);
router.use(requireAdminOrSuperAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/orders-per-hour', getOrdersPerHour);
router.get('/top-selling', getTopSellingItems);
router.get('/revenue', getRevenueSummary);
router.get('/repeat-customers', getRepeatCustomers);
router.get('/bookings', getBookingStats);

export default router;

