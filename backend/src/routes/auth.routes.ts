import { Router } from 'express';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import {
  superAdminLogin,
  masterAdminLogin,
  adminLogin,
  createAdmin,
  changeOwnPassword,
  customerRegister,
  customerLogin,
} from '../controllers/auth.controller';

const router = Router();

// Super Admin login (platform panel — separate link)
router.post('/super-admin/login', superAdminLogin);

// Master Admin login (platform panel — separate link)
router.post('/master-admin/login', masterAdminLogin);

// Rental admin / staff login (restaurant panel only)
router.post('/admin/login', adminLogin);
router.post('/admin/create', authenticate, requireAdminOrSuperAdmin, createAdmin);

// Logged-in user: change own password (rental admin / super admin)
router.put('/me/password', authenticate, changeOwnPassword);

// Customer auth
router.post('/register', customerRegister);
router.post('/login', customerLogin);

// Legacy route aliases (kept for backward compatibility)
router.post('/login', adminLogin);
router.post('/create', authenticate, requireAdminOrSuperAdmin, createAdmin);

export default router;
