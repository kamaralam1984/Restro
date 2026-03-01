import { Router } from 'express';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import {
  getRestaurantBySlug,
  getMyRestaurant,
  updateMyRestaurant,
} from '../controllers/restaurant.controller';
import { getPlans } from '../controllers/rentalPlan.controller';
import { getMySubscriptions } from '../controllers/subscription.controller';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/by-slug/:slug', getRestaurantBySlug);
router.get('/plans', getPlans);

// ── Restaurant Admin (authenticated) ─────────────────────────────────────────
router.get('/me', authenticate, getMyRestaurant);
router.put('/me', authenticate, requireAdminOrSuperAdmin, updateMyRestaurant);
router.get('/me/subscriptions', authenticate, requireAdminOrSuperAdmin, getMySubscriptions);

export default router;
