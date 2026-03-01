import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { getRevenueStats, getCustomerStats } from '../controllers/revenue.controller';

const router = Router();

// All revenue routes are protected - only admin users
router.use(authenticate, requireAdmin);

// Revenue statistics
router.get('/stats', getRevenueStats);

// Customer statistics
router.get('/customers', getCustomerStats);

export default router;

