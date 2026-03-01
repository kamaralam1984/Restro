import { Router } from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getReviews);
router.get('/:id', getReview);
router.post('/', createReview); // Customers can create reviews

// Protected admin routes
router.put('/:id', authenticate, requireAdminOrSuperAdmin, updateReview);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, deleteReview);

export default router;

