import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  createBillFromOrder,
  createOfflineBill,
  getBills,
  getBill,
  updateBillStatus,
} from '../controllers/billing.controller';

const router = Router();

// All billing routes are protected - only admin/shopper users
router.use(authenticate, requireAdmin);

// Online order billing
router.post('/from-order', createBillFromOrder);

// Offline billing (walk-in)
router.post('/offline', createOfflineBill);

// List & detail
router.get('/', getBills);
router.get('/:id', getBill);

// Update payment/status
router.put('/:id/status', updateBillStatus);

export default router;


