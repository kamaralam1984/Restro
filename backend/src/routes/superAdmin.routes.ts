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
  updateSubscription,
} from '../controllers/subscription.controller';
import {
  getVisitors,
  getVisitorById,
  sendVisitorInfo,
  getVisitorAnalytics,
} from '../controllers/visitor.controller';
import { getAuditLogs } from '../controllers/auditLog.controller';
import { exportBackup, importBackup } from '../controllers/backup.controller';
import { getErrorLogs, updateErrorLogStatus } from '../controllers/errorLog.controller';
import { scanAndRepairSystem } from '../controllers/systemHealth.controller';

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
router.patch('/subscriptions/:id', updateSubscription);
router.patch('/subscriptions/:id/cancel', cancelSubscription);
router.get('/subscriptions/stats', getSubscriptionStats);

// ── Visitors / traffic ────────────────────────────────────────────────────────
router.get('/visitors', getVisitors);
router.get('/visitors/:id', getVisitorById);
router.post('/visitors/:id/send-info', sendVisitorInfo);
router.get('/visitors-analytics', getVisitorAnalytics);

// ── Backup & Restore (Super Admin only – be careful) ────────────────────────────
router.get('/backup', exportBackup);
router.post('/backup/import', importBackup);

// ── Error handling / bug control ────────────────────────────────────────────────
router.get('/error-logs', getErrorLogs);
router.patch('/error-logs/:id/status', updateErrorLogStatus);
router.post('/system/scan-repair', scanAndRepairSystem);

export default router;
