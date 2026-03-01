import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from '../controllers/order.controller';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public route (for customers to create orders)
router.post('/', createOrder);

// Protected admin routes
router.get('/', authenticate, requireAdminOrSuperAdmin, getOrders);
router.get('/:id', authenticate, requireAdminOrSuperAdmin, getOrder);
router.put('/:id/status', authenticate, requireAdminOrSuperAdmin, updateOrderStatus);
router.put('/:id/payment', authenticate, requireAdminOrSuperAdmin, updatePaymentStatus);

export default router;

