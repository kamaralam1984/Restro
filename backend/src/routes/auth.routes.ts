import { Router } from 'express';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import {
  superAdminLogin,
  adminLogin,
  createAdmin,
  customerRegister,
  customerLogin,
} from '../controllers/auth.controller';

const router = Router();

// Super Admin login (platform level)
router.post('/super-admin/login', superAdminLogin);

// Restaurant admin / staff login
router.post('/admin/login', adminLogin);
router.post('/admin/create', authenticate, requireAdminOrSuperAdmin, createAdmin);

// Customer auth
router.post('/register', customerRegister);
router.post('/login', customerLogin);

// Legacy route aliases (kept for backward compatibility)
router.post('/login', adminLogin);
router.post('/create', authenticate, requireAdminOrSuperAdmin, createAdmin);

export default router;
