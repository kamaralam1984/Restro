import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = Router();

// Upload image route (admin only)
router.post(
  '/image',
  authenticate,
  requireAdminOrSuperAdmin,
  uploadSingle,
  uploadImage
);

export default router;

