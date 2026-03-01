import { Router } from 'express';
import { authenticate, requirePlatformAdmin } from '../middleware/auth.middleware';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  updateRestaurantStatus,
  getRestaurantStats,
  updateRestaurantFeatures,
  resetRestaurantAdminPassword,
  getPlatformAnalytics,
} from '../controllers/restaurant.controller';
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/rentalPlan.controller';
import {
  getAllSubscriptions,
  createSubscription,
  cancelSubscription,
  getSubscriptionStats,
} from '../controllers/subscription.controller';
import { getAuditLogs } from '../controllers/auditLog.controller';

const router = Router();

// Platform panel: super_admin and master_admin (same API, separate login links)
router.use(authenticate, requirePlatformAdmin);

// ── Restaurants ───────────────────────────────────────────────────────────────
router.get('/restaurants', getAllRestaurants);
router.get('/restaurants/:id', getRestaurantById);
router.get('/restaurants/:id/stats', getRestaurantStats);
router.post('/restaurants', createRestaurant);
router.put('/restaurants/:id', updateRestaurant);
router.patch('/restaurants/:id/status', updateRestaurantStatus);
router.patch('/restaurants/:id/features', updateRestaurantFeatures);
router.post('/restaurants/:id/reset-password', resetRestaurantAdminPassword);

router.get('/analytics', getPlatformAnalytics);
router.get('/audit-logs', getAuditLogs);

// ── Rental Plans ──────────────────────────────────────────────────────────────
router.get('/plans', getAllPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// ── Subscriptions ─────────────────────────────────────────────────────────────
router.get('/subscriptions', getAllSubscriptions);
router.post('/subscriptions', createSubscription);
router.patch('/subscriptions/:id/cancel', cancelSubscription);
router.get('/subscriptions/stats', getSubscriptionStats);

export default router;
