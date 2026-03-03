import { Router } from 'express';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import {
  getRestaurantBySlug,
  getMyRestaurant,
  updateMyRestaurant,
  getRolePermissions,
  updateRolePermissions,
  restaurantSignup,
} from '../controllers/restaurant.controller';
import { requireAdmin } from '../middleware/auth.middleware';
import { getPlans } from '../controllers/rentalPlan.controller';
import { getMySubscriptions } from '../controllers/subscription.controller';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/by-slug/:slug', getRestaurantBySlug);
router.get('/plans', getPlans);
router.post('/signup', restaurantSignup);

// ── Restaurant Admin (authenticated) ─────────────────────────────────────────
router.get('/me', authenticate, getMyRestaurant);
router.put('/me', authenticate, requireAdminOrSuperAdmin, updateMyRestaurant);
router.get('/me/role-permissions', authenticate, getRolePermissions);
router.put('/me/role-permissions', authenticate, requireAdmin, updateRolePermissions);
router.get('/me/subscriptions', authenticate, requireAdminOrSuperAdmin, getMySubscriptions);

export default router;
