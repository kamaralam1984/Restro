import { Router } from 'express';
import {
  getTables,
  getTable,
  checkTableAvailability,
  updateTableStatus,
  initializeTables,
} from '../controllers/table.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getTables);
router.get('/:id', getTable);
router.post('/check-availability', checkTableAvailability);

// Admin routes
router.post('/initialize', authenticate, requireAdmin, initializeTables);
router.put('/:id/status', authenticate, requireAdmin, updateTableStatus);

export default router;

