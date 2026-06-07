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
  unifiedLogin,
  unifiedSignup,
  sendSignupOtp,
  verifySignupOtp,
  getMe,
  updateMe,
} from '../controllers/auth.controller';

const router = Router();

// Super Admin login (platform panel — separate link)
router.post('/super-admin/login', superAdminLogin);

// Master Admin login (platform panel — separate link)
router.post('/master-admin/login', masterAdminLogin);

// Rental admin / staff login (restaurant panel only)
router.post('/admin/login', adminLogin);
router.post('/admin/create', authenticate, requireAdminOrSuperAdmin, createAdmin);

// Logged-in user: profile
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.put('/me/password', authenticate, changeOwnPassword);

// Customer auth
router.post('/register', customerRegister);
router.post('/login', customerLogin);

// Legacy route aliases (kept for backward compatibility)
router.post('/login', adminLogin);
router.post('/create', authenticate, requireAdminOrSuperAdmin, createAdmin);

// Unified auth (all roles)
router.post('/unified-login', unifiedLogin);
router.post('/unified-signup', unifiedSignup);

// OTP-based signup flow
router.post('/send-signup-otp', sendSignupOtp);
router.post('/verify-signup-otp', verifySignupOtp);

export default router;
