import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireAdminOrSuperAdmin);

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Create new user
router.post('/', createUser);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

export default router;

