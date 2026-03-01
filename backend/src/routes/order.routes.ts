import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from '../controllers/order.controller';
import { authenticate, requireStaffOrAdmin } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();

// Public route (for customers to create orders)
router.post('/', createOrder);

// Protected: manager/staff/admin – staff can only read + update status; manager/admin can update payment
router.get('/', authenticate, requireStaffOrAdmin, requirePermission('orders:read'), getOrders);
router.get('/:id', authenticate, requireStaffOrAdmin, requirePermission('orders:read'), getOrder);
router.put('/:id/status', authenticate, requireStaffOrAdmin, requirePermission('orders:update'), updateOrderStatus);
router.put('/:id/payment', authenticate, requireStaffOrAdmin, requirePermission('orders:manage'), updatePaymentStatus);

export default router;

