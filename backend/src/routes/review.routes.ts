import { Router } from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getReviews);
router.get('/:id', getReview);
router.post('/', createReview); // Customers can create reviews

// Protected admin routes
router.put('/:id', authenticate, requireAdmin, updateReview);
router.delete('/:id', authenticate, requireAdmin, deleteReview);

export default router;

