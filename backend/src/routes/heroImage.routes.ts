import { Router } from 'express';
import {
  getHeroImages,
  getAllHeroImages,
  upsertHeroImage,
  deleteHeroImage,
  updateHeroImageOrder,
} from '../controllers/heroImage.controller';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public route - get active hero images
router.get('/', getHeroImages);

// Admin routes
router.get('/admin', authenticate, requireAdminOrSuperAdmin, getAllHeroImages);
router.post('/admin', authenticate, requireAdminOrSuperAdmin, upsertHeroImage);
router.put('/admin/order', authenticate, requireAdminOrSuperAdmin, updateHeroImageOrder);
router.delete('/admin/:id', authenticate, requireAdminOrSuperAdmin, deleteHeroImage);

export default router;

