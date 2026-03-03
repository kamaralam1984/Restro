import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';

// Get all users — filtered by requester role
// Rental admin: only same restaurant's users (admin, manager, staff, cashier, customer) — no super_admin/master_admin
// Master admin: all users except super_admin
// Super admin: all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;
    const currentUser = (req as any).user;
    const currentRole = currentUser?.role;
    const currentRestaurantId = currentUser?.restaurantId;

    let query: Record<string, unknown> = {};

    if (currentRole === 'super_admin') {
      // Super admin: all users, no extra filter
    } else if (currentRole === 'master_admin') {
      // Master admin: exclude super_admin only
      query.role = { $ne: 'super_admin' };
    } else {
      // Rental admin: only this restaurant's users; never show super_admin or master_admin
      query.restaurantId = currentRestaurantId || null;
      query.role = { $in: ['admin', 'manager', 'staff', 'cashier', 'customer'] };
    }

    if (role && (role === 'customer' || role === 'admin' || role === 'staff' || role === 'manager' || role === 'cashier')) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
};

// Helper: check if current user can access target user
function canAccessUser(currentRole: string, currentRestaurantId: string | undefined, targetUser: { role: string; restaurantId?: unknown }) {
  if (currentRole === 'super_admin') return true;
  if (currentRole === 'master_admin') return targetUser.role !== 'super_admin';
  if (['admin', 'manager', 'staff', 'cashier'].includes(currentRole)) {
    if (targetUser.role === 'super_admin' || targetUser.role === 'master_admin') return false;
    const targetRest = targetUser.restaurantId?.toString?.() ?? targetUser.restaurantId;
    return targetRest === (currentRestaurantId || null);
  }
  return false;
}

// Get user by ID — same visibility rules as getAllUsers
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const user = await User.findById(id).select('-password').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!canAccessUser(currentUser?.role, currentUser?.restaurantId, user)) {
      return res.status(403).json({ error: 'Not allowed to view this user' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
};

// Create new user — rental: must use own restaurantId; master: cannot create super_admin; super: any
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role, restaurantId: bodyRestaurantId } = req.body;
    const currentUser = (req as any).user;
    const currentRole = currentUser?.role;
    const currentRestaurantId = currentUser?.restaurantId;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    let allowedRole = role || 'customer';
    let restaurantId = bodyRestaurantId;

    if (currentRole === 'super_admin') {
      restaurantId = bodyRestaurantId ?? null;
      if (allowedRole === 'super_admin' || allowedRole === 'master_admin') {
        // allowed
      }
    } else if (currentRole === 'master_admin') {
      if (allowedRole === 'super_admin') {
        return res.status(403).json({ error: 'Cannot create super admin user' });
      }
      restaurantId = bodyRestaurantId ?? null;
    } else {
      // Rental admin: can only create users in their restaurant; cannot create super_admin or master_admin
      if (['super_admin', 'master_admin'].includes(allowedRole)) {
        return res.status(403).json({ error: 'Cannot create platform admin user' });
      }
      restaurantId = currentRestaurantId ?? null;
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      ...(restaurantId ? { restaurantId } : { $or: [{ restaurantId: null }, { restaurantId: { $exists: false } }] }),
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists in this context' });
    }

    let hashedPassword: string;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      hashedPassword = await bcrypt.hash('Password123', 10);
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: allowedRole,
      restaurantId: restaurantId ?? undefined,
    });

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
};

// Update user — same visibility rules; rental cannot change role to super_admin/master_admin
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, role } = req.body;
    const currentUser = (req as any).user;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!canAccessUser(currentUser?.role, currentUser?.restaurantId, user)) {
      return res.status(403).json({ error: 'Not allowed to update this user' });
    }
    if (currentUser?.role !== 'super_admin' && role && ['super_admin', 'master_admin'].includes(role)) {
      return res.status(403).json({ error: 'Cannot set platform admin role' });
    }

    // Update fields
    if (name) user.name = name.trim();
    if (email) {
      // Check if email is being changed and if it already exists
      if (email.toLowerCase() !== user.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        user.email = email.toLowerCase().trim();
      }
    }
    if (phone) user.phone = phone.trim();
    if (role) {
      const allowedRoles = ['customer', 'admin', 'manager', 'staff', 'cashier', 'master_admin', 'super_admin'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      user.role = role;
    }
    
    // Update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      message: 'User updated successfully',
      user: userResponse,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: error.message || 'Failed to update user' });
  }
};

// Delete user — same visibility rules
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    if (id === currentUser?.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!canAccessUser(currentUser?.role, currentUser?.restaurantId, user)) {
      return res.status(403).json({ error: 'Not allowed to delete this user' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
};

