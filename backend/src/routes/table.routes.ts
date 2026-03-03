import { Router } from 'express';
import {
  getTables,
  getTable,
  checkTableAvailability,
  updateTableStatus,
  updateTableRateOffer,
  initializeTables,
} from '../controllers/table.controller';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getTables);
router.get('/:id', getTable);
router.post('/check-availability', checkTableAvailability);

// Admin routes
router.post('/initialize', authenticate, requireAdminOrSuperAdmin, initializeTables);
router.put('/:id/status', authenticate, requireAdminOrSuperAdmin, updateTableStatus);
router.patch('/:id/rate-offer', authenticate, requireAdminOrSuperAdmin, updateTableRateOffer);

export default router;

