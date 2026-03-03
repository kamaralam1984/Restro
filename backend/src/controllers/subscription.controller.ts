import { Request, Response } from 'express';
import { Subscription } from '../models/Subscription.model';
import { Restaurant } from '../models/Restaurant.model';
import { RentalPlan } from '../models/RentalPlan.model';

// ─── Super Admin: List all subscriptions ─────────────────────────────────────

export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const { restaurantId, status, page = 1, limit = 20 } = req.query;
    const filter: Record<string, any> = {};
    if (restaurantId) filter.restaurantId = restaurantId;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .populate('restaurantId', 'name slug')
        .populate('planId', 'name price')
        .populate('collectedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Subscription.countDocuments(filter),
    ]);

    res.json({ subscriptions, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Restaurant Admin: Get own subscriptions ─────────────────────────────────

export const getMySubscriptions = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) return res.status(400).json({ error: 'No restaurant context' });

    const subscriptions = await Subscription.find({ restaurantId })
      .populate('planId', 'name price features')
      .sort({ createdAt: -1 })
      .lean();

    res.json(subscriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Create subscription (activate restaurant) ──────────────────

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const {
      restaurantId, planId, billingCycle,
      paymentMethod, paymentId, notes, amount,
    } = req.body;

    const [restaurant, plan] = await Promise.all([
      Restaurant.findById(restaurantId),
      RentalPlan.findById(planId),
    ]);

    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const startDate = new Date();
    const endDate = new Date(startDate);
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const finalAmount =
      amount ?? (billingCycle === 'yearly' ? plan.yearlyPrice ?? plan.price * 12 : plan.price);

    const subscription = await Subscription.create({
      restaurantId,
      planId,
      billingCycle,
      status: 'active',
      amount: finalAmount,
      currency: restaurant.currency || 'INR',
      startDate,
      endDate,
      nextBillingDate: endDate,
      paymentMethod: paymentMethod || 'cash',
      paymentId,
      autoRenew: true,
      collectedBy: req.user?.userId,
      notes,
    });

    // Update restaurant subscription status and plan
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $set: {
        subscriptionStatus: 'active',
        currentPlanId: planId,
        trialEndsAt: undefined,
      },
    });

    res.status(201).json({ message: 'Subscription created', subscription });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Cancel subscription ────────────────────────────────────────

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'cancelled', autoRenew: false } },
      { new: true }
    );
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    // Suspend restaurant if no other active subscription
    const activeCount = await Subscription.countDocuments({
      restaurantId: subscription.restaurantId,
      status: 'active',
    });
    if (activeCount === 0) {
      await Restaurant.findByIdAndUpdate(subscription.restaurantId, {
        $set: { subscriptionStatus: 'suspended' },
      });
    }

    res.json({ message: 'Subscription cancelled', subscription });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Update subscription (status / autoRenew / dates / notes) ───

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      autoRenew,
      endDate,
      nextBillingDate,
      notes,
      amount,
    } = req.body as {
      status?: 'active' | 'expired' | 'cancelled' | 'past_due';
      autoRenew?: boolean;
      endDate?: string;
      nextBillingDate?: string;
      notes?: string;
      amount?: number;
    };

    const update: Record<string, any> = {};
    if (status) update.status = status;
    if (typeof autoRenew === 'boolean') update.autoRenew = autoRenew;
    if (endDate) update.endDate = new Date(endDate);
    if (nextBillingDate) update.nextBillingDate = new Date(nextBillingDate);
    if (typeof amount === 'number' && !Number.isNaN(amount)) update.amount = amount;
    if (typeof notes === 'string') update.notes = notes.trim();

    const subscription = await Subscription.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    // Keep restaurant.subscriptionStatus in sync with active subscriptions
    if (status) {
      const activeCount = await Subscription.countDocuments({
        restaurantId: subscription.restaurantId,
        status: 'active',
      });
      if (activeCount > 0 && status === 'active') {
        await Restaurant.findByIdAndUpdate(subscription.restaurantId, {
          $set: { subscriptionStatus: 'active' },
        });
      } else if (activeCount === 0 && status !== 'active') {
        await Restaurant.findByIdAndUpdate(subscription.restaurantId, {
          $set: { subscriptionStatus: 'suspended' },
        });
      }
    }

    res.json({ message: 'Subscription updated', subscription });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Super Admin: Dashboard subscription summary ──────────────────────────────

export const getSubscriptionStats = async (_req: Request, res: Response) => {
  try {
    const [active, expired, trial, totalRevenue] = await Promise.all([
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'expired' }),
      Restaurant.countDocuments({ subscriptionStatus: 'trial' }),
      Subscription.aggregate([
        { $match: { status: { $in: ['active', 'expired'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      activeSubscriptions: active,
      expiredSubscriptions: expired,
      restaurantsOnTrial: trial,
      totalRevenue: totalRevenue[0]?.total ?? 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
