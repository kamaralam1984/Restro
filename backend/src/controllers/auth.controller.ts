import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { User } from '../models/User.model';
import { Restaurant } from '../models/Restaurant.model';
import { OtpStore } from '../models/OtpStore.model';
import { generateToken } from '../utils/jwt';

const sendOtpEmail = async (email: string, otp: string, name: string) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  if (!user || !pass) {
    console.log(`[OTP] ${email} → ${otp} (email not configured, showing in console)`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: `"Restro OS" <${user}>`,
    to: email,
    subject: 'Your Restro OS Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#141414;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#8b5a00,#c8972a);padding:32px;text-align:center">
          <h1 style="color:#fff8e8;margin:0;font-size:28px">Restro OS</h1>
          <p style="color:rgba(255,248,232,0.8);margin:6px 0 0;font-size:13px">Premium Restaurant Platform</p>
        </div>
        <div style="padding:32px;text-align:center">
          <p style="color:#a89070;font-size:15px;margin:0 0 8px">Hi <strong style="color:#f8f4ed">${name}</strong>, your verification code is:</p>
          <div style="background:#1c1c1c;border:1px solid rgba(200,151,42,0.3);border-radius:12px;padding:24px;margin:24px 0">
            <span style="color:#f0c060;font-size:40px;font-weight:900;letter-spacing:12px">${otp}</span>
          </div>
          <p style="color:#6b5040;font-size:13px;margin:0">Valid for 10 minutes. Do not share this code.</p>
        </div>
      </div>`,
  });
};

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

// ─── Unified Login (all roles) ───────────────────────────────────────────────

// Unified login — works for ALL roles (customer, admin, staff, super_admin, master_admin, restaurant_owner)
export const unifiedLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !user.password)
      return res.status(401).json({ error: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ error: 'Account is deactivated. Contact support.' });

    const valid = await bcrypt.compare(password.trim(), user.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Determine redirect based on role
    const redirectMap: Record<string, string> = {
      super_admin: '/admin/super',
      master_admin: '/admin/master',
      admin: '/dashboard',
      manager: '/dashboard',
      staff: '/dashboard',
      cashier: '/dashboard',
      restaurant_owner: '/dashboard',
      customer: '/',
    };
    const redirect = redirectMap[user.role] ?? '/';

    res.json({
      token,
      redirect,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId ?? null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
};

// ─── Unified Signup (customers and restaurant owners) ────────────────────────

// Unified signup — for customers and restaurant owners only
export const unifiedSignup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, restaurantName } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    const allowedRoles = ['customer', 'restaurant_owner'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const hashedPassword = await bcrypt.hash(password.trim(), 12);

    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
      isActive: true,
      restaurantId: null,
      phone: '',
    };

    if (userRole === 'restaurant_owner' && restaurantName) {
      userData.restaurantName = restaurantName.trim();
    }

    const newUser = await User.create(userData);

    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    const redirect = userRole === 'restaurant_owner' ? '/dashboard' : '/';

    res.status(201).json({
      token,
      redirect,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Signup failed' });
  }
};

// ─── Send Signup OTP ─────────────────────────────────────────────────────────

export const sendSignupOtp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = await bcrypt.hash(password.trim(), 12);

    // Remove any previous OTP for this email
    await OtpStore.deleteMany({ email: email.toLowerCase().trim() });

    await OtpStore.create({
      email: email.toLowerCase().trim(),
      otp,
      name: name.trim(),
      passwordHash,
    });

    await sendOtpEmail(email.toLowerCase().trim(), otp, name.trim());

    res.json({ message: 'OTP sent to your email' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
};

// ─── Verify Signup OTP & Create Account ──────────────────────────────────────

export const verifySignupOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: 'Email and OTP are required' });

    const record = await OtpStore.findOne({ email: email.toLowerCase().trim() });
    if (!record)
      return res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });

    if (record.otp !== otp.trim())
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });

    // Check again if user was created in the meantime
    const existing = await User.findOne({ email: record.email });
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists' });

    const newUser = await User.create({
      name: record.name,
      email: record.email,
      password: record.passwordHash,
      role: 'customer',
      isActive: true,
      restaurantId: null,
      phone: '',
    });

    await OtpStore.deleteOne({ _id: record._id });

    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      token,
      redirect: '/',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
};

// GET /me — fetch own profile
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /me — update own profile (name, phone)
export const updateMe = async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    const updates: Record<string, string> = {};
    if (name?.trim()) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { $set: updates },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
