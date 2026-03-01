import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public route (for customers to create orders)
// Validation is handled inside the controller; keep this route simple to avoid blocking orders
router.post('/', createOrder);

// Protected admin routes
router.get('/', authenticate, requireAdmin, getOrders);
router.get('/:id', authenticate, requireAdmin, getOrder);
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus);
router.put('/:id/payment', authenticate, requireAdmin, updatePaymentStatus);

export default router;

