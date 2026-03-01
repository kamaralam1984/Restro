import { Router } from 'express';
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
  getPriceRange,
} from '../controllers/menu.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateMenuCreate } from '../middleware/validation.middleware';

const router = Router();

// Public routes
router.get('/', getMenuItems);
router.get('/categories', getCategories);
router.get('/price-range', getPriceRange);
router.get('/:id', getMenuItem);

// Protected admin routes
router.post('/', authenticate, requireAdmin, validateMenuCreate, createMenuItem);
router.put('/:id', authenticate, requireAdmin, updateMenuItem);
router.delete('/:id', authenticate, requireAdmin, deleteMenuItem);

export default router;

