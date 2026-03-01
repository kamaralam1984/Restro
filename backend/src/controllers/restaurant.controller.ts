import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Restaurant } from '../models/Restaurant.model';
import { User } from '../models/User.model';
import { RentalPlan } from '../models/RentalPlan.model';
import { Subscription } from '../models/Subscription.model';
import { Menu } from '../models/Menu.model';
import { Order } from '../models/Order.model';
import { Booking } from '../models/Booking.model';

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
          taxRate: taxRate ?? 18,
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

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: { ...restaurant.toObject(), razorpayKeySecret: undefined },
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

    res.json({ message: 'Restaurant settings updated', restaurant });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Public: Get restaurant info by slug (for frontend) ──────────────────────

export const getRestaurantBySlug = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug, status: 'active' })
      .select('-razorpayKeySecret -emailConfig.password -whatsappApiKey')
      .lean();
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
