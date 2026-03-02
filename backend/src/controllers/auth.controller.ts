import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { Restaurant } from '../models/Restaurant.model';
import { generateToken } from '../utils/jwt';

// ─── Super Admin Login ────────────────────────────────────────────────────────

export const superAdminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await User.findOne({
      email: email.toLowerCase().trim(),
      role: 'super_admin',
    }).select('+password');

    if (!admin || !admin.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password.trim(), admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    res.json({
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
};

// ─── Master Admin Login (platform panel, separate link) ────────────────────────

export const masterAdminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await User.findOne({
      email: email.toLowerCase().trim(),
      role: 'master_admin',
    }).select('+password');

    if (!admin || !admin.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password.trim(), admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
};

// ─── Rental Admin / Staff Login (restaurant panel only; super_admin/master_admin use their own links) ─

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password, restaurantId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Only restaurant-level roles: admin, manager, staff, cashier (not super_admin or master_admin)
    const query: Record<string, any> = {
      email: email.toLowerCase().trim(),
      role: { $in: ['admin', 'manager', 'staff', 'cashier'] },
    };
    if (restaurantId) query.restaurantId = restaurantId;

    const admin = await User.findOne(query).select('+password');

    if (!admin || !admin.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password.trim(), admin.password);

    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    if (!admin.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact your admin.' });
    }

    const token = generateToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      restaurantId: admin.restaurantId?.toString(),
    });

    const adminPayload: Record<string, any> = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      restaurantId: admin.restaurantId,
    };
    if (admin.restaurantId) {
      const restaurant = await Restaurant.findById(admin.restaurantId).select('slug name').lean();
      if (restaurant) {
        adminPayload.restaurantSlug = restaurant.slug;
        adminPayload.restaurantName = restaurant.name;
      }
    }

    res.json({
      token,
      admin: adminPayload,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
};

// ─── Change own password (logged-in admin / rental admin) ─────────────────────

export const changeOwnPassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user || !user.password) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword.trim(), user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword.trim(), 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update password' });
  }
};

// ─── Customer Register ────────────────────────────────────────────────────────

export const customerRegister = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, restaurantId } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase(), restaurantId });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: 'customer',
      restaurantId,
      isActive: true,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId?.toString(),
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
};

// ─── Customer Login ───────────────────────────────────────────────────────────

export const customerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password, restaurantId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const query: Record<string, any> = {
      email: email.toLowerCase().trim(),
      role: 'customer',
    };
    if (restaurantId) query.restaurantId = restaurantId;

    const user = await User.findOne(query).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password.trim(), user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId?.toString(),
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
};

// ─── Create Restaurant Staff / Admin User ────────────────────────────────────

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, restaurantId } = req.body;

    const targetRole = role || 'admin';
    const targetRestaurantId = restaurantId || req.user?.restaurantId;

    if (!targetRestaurantId) {
      return res.status(400).json({ error: 'restaurantId is required' });
    }

    const existingAdmin = await User.findOne({ email, restaurantId: targetRestaurantId });
    if (existingAdmin) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password || 'Admin@123', 10);
    const admin = await User.create({
      name: name || 'Admin',
      email: email.toLowerCase(),
      phone: phone || '',
      role: targetRole,
      password: hashedPassword,
      restaurantId: targetRestaurantId,
      isActive: true,
    });

    res.status(201).json({
      message: 'User created successfully',
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
};
