import { Router } from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth.middleware';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  updateRestaurantStatus,
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

const router = Router();

// All super-admin routes require authentication + super_admin role
router.use(authenticate, requireSuperAdmin);

// ── Restaurants ───────────────────────────────────────────────────────────────
router.get('/restaurants', getAllRestaurants);
router.get('/restaurants/:id', getRestaurantById);
router.post('/restaurants', createRestaurant);
router.put('/restaurants/:id', updateRestaurant);
router.patch('/restaurants/:id/status', updateRestaurantStatus);

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
