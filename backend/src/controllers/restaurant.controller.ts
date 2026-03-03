import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Restaurant, StaffPermissionKey } from '../models/Restaurant.model';
import { User } from '../models/User.model';
import { RentalPlan, IRentalPlan } from '../models/RentalPlan.model';
import { Subscription } from '../models/Subscription.model';
import { Menu } from '../models/Menu.model';
import { seedDefaultMenuForRestaurant } from '../services/defaultMenu.service';
import { createDefaultTablesForRestaurant } from './table.controller';
import { Order } from '../models/Order.model';
import { Booking } from '../models/Booking.model';
import { createRazorpayOrder } from '../config/razorpay';
import { PendingRestaurantSignup } from '../models/PendingRestaurantSignup.model';

// ─── Super Admin: Reset restaurant admin password ─────────────────────────────

export const resetRestaurantAdminPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const admin = await User.findOne({
      restaurantId: req.params.id,
      role: { $in: ['admin', 'manager'] },
    }).sort({ role: 1 }); // prefer 'admin' role

    if (!admin) return res.status(404).json({ error: 'No admin user found for this restaurant' });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: 'Password reset successfully', adminEmail: admin.email });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Platform-wide business analytics ───────────────────────────

export const getPlatformAnalytics = async (req: Request, res: Response) => {
  try {
    const days = parseInt((req.query.days as string) || '30', 10);
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    // Per-restaurant revenue summary
    const perRestaurantRaw = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$restaurantId',
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] },
          },
          onlineOrders: {
            $sum: { $cond: [{ $in: ['$paymentMethod', ['online', 'card']] }, 1, 0] },
          },
          onlineRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$paymentStatus', 'paid'] },
                    { $in: ['$paymentMethod', ['online', 'card']] },
                  ],
                },
                '$total',
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurant',
        },
      },
      { $unwind: { path: '$restaurant', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$restaurant.name', 'Unknown'] },
          city: { $ifNull: ['$restaurant.city', ''] },
          status: { $ifNull: ['$restaurant.status', 'active'] },
          totalOrders: 1,
          totalRevenue: 1,
          onlineOrders: 1,
          onlineRevenue: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Daily revenue trend (last N days) across all restaurants
    const dailyTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          onlineRevenue: {
            $sum: {
              $cond: [{ $in: ['$paymentMethod', ['online', 'card']] }, '$total', 0],
            },
          },
        },
      },
      { $sort: { '_id.date': 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          revenue: 1,
          orders: 1,
          onlineRevenue: 1,
        },
      },
    ]);

    // Platform totals
    const [totals] = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] },
          },
          onlineRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$paymentStatus', 'paid'] },
                    { $in: ['$paymentMethod', ['online', 'card']] },
                  ],
                },
                '$total',
                0,
              ],
            },
          },
          onlineOrders: {
            $sum: { $cond: [{ $in: ['$paymentMethod', ['online', 'card']] }, 1, 0] },
          },
        },
      },
    ]);

    const [activeRestaurants, expiredSubscriptions, mrrResult] = await Promise.all([
      Restaurant.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'expired' }),
      Subscription.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, totalMRR: { $sum: '$amount' } } },
      ]),
    ]);

    const totalMRR = mrrResult[0]?.totalMRR ?? 0;

    res.json({
      period: days,
      totals: totals || { totalOrders: 0, totalRevenue: 0, onlineRevenue: 0, onlineOrders: 0 },
      totalRestaurants: activeRestaurants,
      totalMRR,
      activeRestaurants,
      expiredSubscriptions,
      perRestaurant: perRestaurantRaw,
      dailyTrend,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: List all restaurants ───────────────────────────────────────

export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const { status, subscriptionStatus, page = 1, limit = 20 } = req.query;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (subscriptionStatus) filter.subscriptionStatus = subscriptionStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .populate('ownerId', 'name email phone')
        .populate('currentPlanId', 'name price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Restaurant.countDocuments(filter),
    ]);

    res.json({ restaurants, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Get single restaurant ──────────────────────────────────────

export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('ownerId', 'name email phone')
      .populate('currentPlanId', 'name price features')
      .lean();

    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Create restaurant + admin user ──────────────────────────────

export const createRestaurant = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      name, slug, phone, address, city, state, country, pincode,
      description, primaryColor, currency,
      taxRate, serviceCharge,
      planId,
      // Admin user details
      adminName, adminEmail, adminPhone, adminPassword,
      // Trial
      trialDays,
    } = req.body;

    // Validate slug uniqueness
    const existing = await Restaurant.findOne({ slug }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(409).json({ error: 'Restaurant slug already exists' });
    }

    // Validate plan
    let plan = null;
    if (planId) {
      plan = await RentalPlan.findById(planId).session(session);
      if (!plan) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Rental plan not found' });
      }
    }

    // Set trial end date
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + (trialDays ?? plan?.trialDays ?? 14));

    // Create restaurant
    const [restaurant] = await Restaurant.create(
      [
        {
          name, slug, phone, address, city, state,
          country: country || 'India', pincode,
          description, primaryColor, currency,
          taxRate: taxRate ?? 5,
          serviceCharge: serviceCharge ?? 0,
          subscriptionStatus: 'trial',
          trialEndsAt: trialEnd,
          currentPlanId: planId || undefined,
          status: 'active',
        },
      ],
      { session }
    );

    // Check if admin email already used for this restaurant (shouldn't exist yet)
    const hashedPassword = await bcrypt.hash(adminPassword || 'Admin@123', 12);
    const [adminUser] = await User.create(
      [
        {
          name: adminName || name,
          email: adminEmail,
          phone: adminPhone || phone,
          role: 'admin',
          password: hashedPassword,
          restaurantId: restaurant._id,
          isActive: true,
        },
      ],
      { session }
    );

    // Set owner
    restaurant.ownerId = adminUser._id as any;
    await restaurant.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Seed default menu items for this restaurant (non-blocking for response)
    seedDefaultMenuForRestaurant(restaurant._id).catch((err) => {
      console.error('Failed to seed default menu for restaurant', err);
    });

    const baseUrl = (process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000')
      .replace(/\/$/, '');
    const storeLink = `${baseUrl}/r/${restaurant.slug}`;

    const restaurantObj = restaurant.toObject() as unknown as Record<string, unknown>;
    delete restaurantObj.razorpayKeySecret;

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: { ...restaurantObj, storeLink },
      storeLink,
      adminUser: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Update restaurant ──────────────────────────────────────────

export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const forbidden = ['slug', 'ownerId']; // immutable fields
    forbidden.forEach((f) => delete req.body[f]);

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email phone');

    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    res.json({ message: 'Restaurant updated', restaurant });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Suspend / activate restaurant ───────────────────────────────

export const updateRestaurantStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({ message: `Restaurant ${status}`, restaurant });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Get restaurant live stats ───────────────────────────────────

export const getRestaurantStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = new mongoose.Types.ObjectId(id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalOrders, todayOrders, totalRevenue, todayRevenue,
      menuItems, staffCount, bookingsTotal, bookingsToday,
    ] = await Promise.all([
      Order.countDocuments({ restaurantId }),
      Order.countDocuments({ restaurantId, createdAt: { $gte: today, $lt: tomorrow } }),
      Order.aggregate([
        { $match: { restaurantId, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { restaurantId, paymentStatus: 'paid', createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Menu.countDocuments({ restaurantId }),
      User.countDocuments({ restaurantId, role: { $in: ['admin', 'manager', 'staff', 'cashier'] } }),
      Booking.countDocuments({ restaurantId }),
      Booking.countDocuments({ restaurantId, createdAt: { $gte: today, $lt: tomorrow } }),
    ]);

    res.json({
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue[0]?.total ?? 0,
      todayRevenue: todayRevenue[0]?.total ?? 0,
      menuItems,
      staffCount,
      bookingsTotal,
      bookingsToday,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Update restaurant features ──────────────────────────────────
// Subscription plan sets the DEFAULT features when restaurant is created.
// After that, Super Admin can override per-restaurant feature toggles here.
export const updateRestaurantFeatures = async (req: Request, res: Response) => {
  try {
    const { features } = req.body;
    if (!features || typeof features !== 'object') {
      return res.status(400).json({ error: 'features object required' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: { features } },
      { new: true, runValidators: true }
    );
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    res.json({ message: 'Features updated', features: restaurant.features });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Restaurant Admin: Get own restaurant profile ────────────────────────────

export const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) return res.status(400).json({ error: 'No restaurant context' });

    const restaurant = await Restaurant.findById(restaurantId)
      .populate('currentPlanId', 'name price features')
      .lean();

    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    // Hide sensitive keys from response
    const safe = { ...restaurant, razorpayKeySecret: undefined };
    res.json(safe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Restaurant Admin: Update own restaurant settings ────────────────────────

export const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) return res.status(400).json({ error: 'No restaurant context' });

    // Admins cannot change slug or subscription status
    const forbidden = ['slug', 'subscriptionStatus', 'trialEndsAt', 'currentPlanId', 'status', 'ownerId'];
    forbidden.forEach((f) => delete req.body[f]);

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    const { cacheDel, cacheKeyRestaurant } = await import('../utils/cache');
    await cacheDel(cacheKeyRestaurant(restaurant.slug));
    res.json({ message: 'Restaurant settings updated', restaurant });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Role permissions (staff panel access) – admin only can update ───────────

const STAFF_PERMISSION_KEYS: StaffPermissionKey[] = [
  'dashboard', 'orders', 'menu', 'bookings', 'heroImages', 'billing',
  'payments', 'revenue', 'customers', 'reviews', 'analytics',
];

export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) return res.status(400).json({ error: 'No restaurant context' });
    const restaurant = await Restaurant.findById(restaurantId).select('rolePermissions').lean();
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({ rolePermissions: restaurant.rolePermissions || {} });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) return res.status(400).json({ error: 'No restaurant context' });
    const { rolePermissions } = req.body;
    if (!rolePermissions || typeof rolePermissions !== 'object') {
      return res.status(400).json({ error: 'rolePermissions object required' });
    }
    const sanitized: Record<string, StaffPermissionKey[]> = {};
    for (const role of ['staff', 'manager', 'cashier']) {
      const perms = rolePermissions[role];
      if (Array.isArray(perms)) {
        sanitized[role] = perms.filter((p: string) =>
          STAFF_PERMISSION_KEYS.includes(p as StaffPermissionKey)
        ) as StaffPermissionKey[];
      }
    }
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: { rolePermissions: sanitized } },
      { new: true }
    ).select('rolePermissions');
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({ message: 'Role permissions updated', rolePermissions: restaurant.rolePermissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Restaurant Admin: Get / update onboarding state ─────────────────────────

export const getOnboarding = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) return res.status(400).json({ error: 'No restaurant context' });
    const restaurant = await Restaurant.findById(restaurantId)
      .select('onboardingStep onboardingCompletedAt')
      .lean();
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({
      step: restaurant.onboardingStep || 'menu',
      completedAt: restaurant.onboardingCompletedAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOnboarding = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) return res.status(400).json({ error: 'No restaurant context' });
    const { step, completed } = req.body;
    const update: Record<string, unknown> = {};
    if (['menu', 'tables', 'razorpay', 'publish', 'done'].includes(step)) {
      update.onboardingStep = step;
    }
    if (completed === true) {
      update.onboardingCompletedAt = new Date();
      update.onboardingStep = 'done';
    }
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $set: update },
      { new: true }
    ).select('onboardingStep onboardingCompletedAt');
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({
      step: restaurant.onboardingStep,
      completedAt: restaurant.onboardingCompletedAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Public: Get restaurant info by slug (for frontend) ──────────────────────
// Returns restaurant even when inactive/suspended so frontend can show "Service Temporarily Suspended"
export const getRestaurantBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const { cacheGet, cacheSet, cacheKeyRestaurant } = await import('../utils/cache');
    const { CACHE_TTL } = await import('../config/redis');
    const cached = await cacheGet(cacheKeyRestaurant(slug));
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const restaurant = await Restaurant.findOne({ slug })
      .select('-razorpayKeySecret -emailConfig.password -whatsappApiKey')
      .lean();
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    await cacheSet(cacheKeyRestaurant(slug), JSON.stringify(restaurant), CACHE_TTL.RESTAURANT_SEC);
    res.json(restaurant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Map plan features to restaurant features (for SaaS feature flags per plan)
function planToRestaurantFeatures(plan: IRentalPlan | null) {
  const p = plan?.features;
  return {
    onlineOrdering: p?.onlineOrdering ?? true,
    tableBooking: p?.tableBooking ?? false,
    billing: p?.billing ?? false,
    onlinePayments: p?.razorpayIntegration ?? true,
    reviews: true,
    heroImages: true,
    whatsappNotifications: p?.whatsappIntegration ?? false,
    analytics: p?.analytics ?? false,
    staffControl: p?.staffControl ?? false,
    menuManagement: true,
  };
}

// ─── Public: Restaurant onboarding signup (no auth) ───────────────────────────
export const restaurantSignup = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, slug, email, planId, adminName, adminPassword, adminPhone } = req.body;

    if (!name || !slug || !email) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Restaurant name, slug, and admin email are required' });
    }
    if (!adminPassword || String(adminPassword).length < 8) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Password is required and must be at least 8 characters' });
    }

    const trimmedSlug = String(slug).toLowerCase().trim().replace(/\s+/g, '-');
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Slug can only contain lowercase letters, numbers, and hyphens' });
    }

    const existing = await Restaurant.findOne({ slug: trimmedSlug }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(409).json({ error: 'This restaurant URL is already taken. Please choose another slug.' });
    }

    // Plan required for subscription; default to first active plan if not provided
    let plan = null;
    if (planId) {
      plan = await RentalPlan.findById(planId).session(session);
    }
    if (!plan) {
      plan = await RentalPlan.findOne({ isActive: true }).sort({ sortOrder: 1 }).session(session);
    }
    if (!plan) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'No plan available. Please contact support.' });
    }

    const trialDays = plan.trialDays ?? 14;
    const startDate = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + trialDays);

    const password = await bcrypt.hash(String(adminPassword), 12);
    const features = planToRestaurantFeatures(plan);

    const [restaurant] = await Restaurant.create(
      [
        {
          name: String(name).trim(),
          slug: trimmedSlug,
          phone: (adminPhone && String(adminPhone).trim()) || '0000000000',
          address: 'To be updated',
          country: 'India',
          subscriptionStatus: 'trial',
          trialEndsAt: trialEnd,
          currentPlanId: plan._id,
          status: 'active',
          features,
        },
      ],
      { session }
    );

    // Subscription record: trial period (start date + end date = trial expiry)
    await Subscription.create(
      [
        {
          restaurantId: restaurant._id,
          planId: plan._id,
          billingCycle: 'monthly',
          status: 'active',
          amount: 0,
          currency: 'INR',
          startDate,
          endDate: trialEnd,
          paymentMethod: 'cash',
          autoRenew: false,
        },
      ],
      { session }
    );

    const [adminUser] = await User.create(
      [
        {
          name: (adminName && String(adminName).trim()) || String(name).trim(),
          email: String(email).toLowerCase().trim(),
          phone: (adminPhone && String(adminPhone).trim()) || '0000000000',
          role: 'admin',
          password,
          restaurantId: restaurant._id,
          isActive: true,
        },
      ],
      { session }
    );

    restaurant.ownerId = adminUser._id as any;
    await restaurant.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Seed default menu and tables for this restaurant (non-blocking)
    seedDefaultMenuForRestaurant(restaurant._id).catch((err) => {
      console.error('Failed to seed default menu for restaurant signup', err);
    });
    createDefaultTablesForRestaurant(restaurant._id as mongoose.Types.ObjectId).catch((err) => {
      console.error('Failed to create default tables for restaurant signup', err);
    });

    const baseUrl = (process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000')
      .replace(/\/$/, '');
    const storeLink = `${baseUrl}/r/${restaurant.slug}`;
    const loginUrl = `${baseUrl}/admin/login`;

    res.status(201).json({
      message: 'Restaurant created successfully. You can now log in.',
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        storeLink,
      },
      adminUser: {
        email: adminUser.email,
        loginUrl,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message || 'Signup failed' });
  }
};

// ─── Public: Paid signup – create Razorpay order and pending signup ────────────

export const restaurantSignupPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { name, slug, email, planId, adminName, adminPassword, adminPhone } = req.body;

    if (!name || !slug || !email || !planId || !adminPassword || String(adminPassword).length < 8) {
      return res.status(400).json({ error: 'Name, slug, plan, email and password are required' });
    }

    const trimmedSlug = String(slug).toLowerCase().trim().replace(/\s+/g, '-');
    if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
      return res.status(400).json({ error: 'Slug can only contain lowercase letters, numbers, and hyphens' });
    }

    const existing = await Restaurant.findOne({ slug: trimmedSlug }).lean();
    if (existing) {
      return res.status(409).json({ error: 'This restaurant URL is already taken. Please choose another slug.' });
    }

    const plan = await RentalPlan.findById(planId).lean();
    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const amount = plan.price;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Plan price is not configured for online payment' });
    }

    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        error:
          'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.',
      });
    }

    const order = await createRazorpayOrder(amount, 'INR');
    const passwordHash = await bcrypt.hash(String(adminPassword), 12);

    const pending = await PendingRestaurantSignup.create({
      name: String(name).trim(),
      slug: trimmedSlug,
      email: String(email).toLowerCase().trim(),
      adminPasswordHash: passwordHash,
      adminName: adminName ? String(adminName).trim() : undefined,
      adminPhone: adminPhone ? String(adminPhone).trim() : undefined,
      planId: plan._id,
      razorpayOrderId: order.id,
    });

    res.json({
      key: RAZORPAY_KEY_ID,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      pendingId: pending._id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create payment order for signup' });
  }
};

// ─── Public: Verify Razorpay payment and complete restaurant signup ────────────

export const restaurantSignupVerifyPayment = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { pendingId, razorpayOrderId, paymentId, signature } = req.body as {
      pendingId?: string;
      razorpayOrderId?: string;
      paymentId?: string;
      signature?: string;
    };

    if (!pendingId || !razorpayOrderId || !paymentId || !signature) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    // Verify payment signature
    const isValid = await (await import('../config/razorpay')).verifyPayment(
      razorpayOrderId,
      paymentId,
      signature
    );
    if (!isValid) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const pending = await PendingRestaurantSignup.findById(pendingId).session(session);
    if (!pending || pending.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Pending signup not found or already completed' });
    }

    // Ensure slug still unique
    const existing = await Restaurant.findOne({ slug: pending.slug }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(409).json({
        error: 'This restaurant URL is already taken. Please start signup again with a different slug.',
      });
    }

    const plan = await RentalPlan.findById(pending.planId).session(session);
    if (!plan) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Plan not found for pending signup' });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const features = planToRestaurantFeatures(plan as any);

    const [restaurant] = await Restaurant.create(
      [
        {
          name: pending.name,
          slug: pending.slug,
          phone: pending.adminPhone || '0000000000',
          address: 'To be updated',
          country: 'India',
          subscriptionStatus: 'active',
          trialEndsAt: undefined,
          currentPlanId: plan._id,
          status: 'active',
          features,
        },
      ],
      { session }
    );

    await Subscription.create(
      [
        {
          restaurantId: restaurant._id,
          planId: plan._id,
          billingCycle: 'monthly',
          status: 'active',
          amount: plan.price,
          currency: 'INR',
          startDate,
          endDate,
          nextBillingDate: endDate,
          paymentMethod: 'online',
          paymentId,
          autoRenew: false,
        },
      ],
      { session }
    );

    const [adminUser] = await User.create(
      [
        {
          name: pending.adminName || pending.name,
          email: pending.email,
          phone: pending.adminPhone || '0000000000',
          role: 'admin',
          password: pending.adminPasswordHash,
          restaurantId: restaurant._id,
          isActive: true,
        },
      ],
      { session }
    );

    restaurant.ownerId = adminUser._id as any;
    await restaurant.save({ session });

    pending.status = 'completed';
    await pending.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Seed default menu and tables (non-blocking)
    seedDefaultMenuForRestaurant(restaurant._id).catch((err) => {
      console.error('Failed to seed default menu for paid signup', err);
    });
    createDefaultTablesForRestaurant(restaurant._id as mongoose.Types.ObjectId).catch((err) => {
      console.error('Failed to create default tables for paid signup', err);
    });

    const baseUrl = (process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(
      /\/$/,
      ''
    );
    const storeLink = `${baseUrl}/r/${restaurant.slug}`;
    const loginUrl = `${baseUrl}/admin/login`;

    res.status(201).json({
      message: 'Restaurant created with paid subscription. You can now log in.',
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        storeLink,
      },
      adminUser: {
        email: adminUser.email,
        loginUrl,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message || 'Signup verification failed' });
  }
};

