import { Router } from 'express';
import { authenticate, requireStaffOrAdmin } from '../middleware/auth.middleware';
import { requireFeature } from '../middleware/featureFlag.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import {
  createBillFromOrder,
  createOfflineBill,
  getBills,
  getBill,
  updateBillStatus,
  getBillingReportPdf,
} from '../controllers/billing.controller';

const router = Router();

// Billing: staff with billing permission (cashier, manager, admin) + billing feature
router.use(authenticate, requireStaffOrAdmin, requirePermission('billing:manage'), requireFeature('billing'));

// Online order billing
router.post('/from-order', createBillFromOrder);

// Offline billing (walk-in)
router.post('/offline', createOfflineBill);

// List & detail
router.get('/', getBills);
router.get('/report/pdf', getBillingReportPdf);
router.get('/:id', getBill);

// Update payment/status
router.put('/:id/status', updateBillStatus);

export default router;


