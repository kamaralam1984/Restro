import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, requireAdmin, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import { Wallet, WalletTransaction } from '../models/Wallet.model';
import { ReferralCode, ReferralUse } from '../models/Referral.model';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get or create wallet for a user in a restaurant context */
async function getOrCreateWallet(userId: string, restaurantId: string) {
  let wallet = await Wallet.findOne({ userId, restaurantId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, restaurantId, balance: 0, currency: 'INR' });
  }
  return wallet;
}

/** Generate a unique referral code */
function generateCode(userId: string): string {
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const prefix = userId.slice(-4).toUpperCase();
  return `REF${prefix}${suffix}`;
}

// ─── GET /wallet/me ───────────────────────────────────────────────────────────
// Get current user's wallet (create if not exists)

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    const wallet = await getOrCreateWallet(userId, restaurantId);
    return res.json({ wallet });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch wallet' });
  }
});

// ─── GET /wallet/me/transactions ──────────────────────────────────────────────
// List transactions for current user (paginated)

router.get('/me/transactions', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { userId, restaurantId };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from as string);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to as string);
    }

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      WalletTransaction.countDocuments(filter),
    ]);

    return res.json({
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch transactions' });
  }
});

// ─── POST /wallet/topup ───────────────────────────────────────────────────────
// Admin adds credits to a user's wallet

router.post('/topup', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, amount, description } = req.body;
    const restaurantId = req.user!.restaurantId;

    if (!userId || !amount || !description) {
      return res.status(400).json({ error: 'userId, amount, description are required' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    const wallet = await getOrCreateWallet(userId, restaurantId);
    const balanceBefore = wallet.balance;
    wallet.balance = parseFloat((wallet.balance + amount).toFixed(2));
    await wallet.save();

    await WalletTransaction.create({
      walletId: wallet._id,
      userId,
      restaurantId,
      type: 'credit',
      amount,
      source: 'topup',
      description,
      balanceBefore,
      balanceAfter: wallet.balance,
    });

    return res.json({ message: 'Credits added successfully', wallet });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Topup failed' });
  }
});

// ─── POST /wallet/pay ─────────────────────────────────────────────────────────
// Deduct from wallet balance for an order payment

router.post('/pay', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;
    const { amount, orderId } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    const wallet = await getOrCreateWallet(userId, restaurantId);
    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    const balanceBefore = wallet.balance;
    wallet.balance = parseFloat((wallet.balance - amount).toFixed(2));
    await wallet.save();

    await WalletTransaction.create({
      walletId: wallet._id,
      userId,
      restaurantId,
      type: 'debit',
      amount,
      source: 'order_payment',
      description: `Payment for order${orderId ? ` #${orderId}` : ''}`,
      orderId: orderId ? new mongoose.Types.ObjectId(orderId) : undefined,
      balanceBefore,
      balanceAfter: wallet.balance,
    });

    return res.json({ message: 'Payment successful', wallet });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment failed' });
  }
});

// ─── POST /wallet/referral/generate ──────────────────────────────────────────
// Generate referral code for current user

router.post('/referral/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    // Check if user already has an active code for this restaurant
    const existing = await ReferralCode.findOne({ userId, restaurantId, isActive: true });
    if (existing) {
      return res.json({ referralCode: existing, message: 'Existing code returned' });
    }

    // Get reward amount from request or default to 50
    const rewardPerReferral = typeof req.body.rewardPerReferral === 'number'
      ? req.body.rewardPerReferral
      : 50;
    const maxUsage = typeof req.body.maxUsage === 'number' ? req.body.maxUsage : -1;

    // Ensure uniqueness
    let code = generateCode(userId);
    let attempts = 0;
    while (await ReferralCode.exists({ code }) && attempts < 10) {
      code = generateCode(userId);
      attempts++;
    }

    const referralCode = await ReferralCode.create({
      userId,
      restaurantId,
      code,
      rewardPerReferral,
      maxUsage,
    });

    return res.status(201).json({ referralCode });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate referral code' });
  }
});

// ─── GET /wallet/referral/me ──────────────────────────────────────────────────
// Get current user's referral code and usage stats

router.get('/referral/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    const referralCode = await ReferralCode.findOne({ userId, restaurantId, isActive: true });
    if (!referralCode) {
      return res.json({ referralCode: null, stats: { totalUses: 0, totalEarned: 0 } });
    }

    const uses = await ReferralUse.find({ referralCodeId: referralCode._id });
    const totalEarned = uses
      .filter((u) => u.status === 'rewarded')
      .reduce((sum, u) => sum + u.rewardAmount, 0);

    return res.json({
      referralCode,
      stats: {
        totalUses: referralCode.usageCount,
        rewardedUses: uses.filter((u) => u.status === 'rewarded').length,
        pendingUses: uses.filter((u) => u.status === 'pending').length,
        totalEarned,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch referral data' });
  }
});

// ─── POST /wallet/referral/apply ──────────────────────────────────────────────
// Apply a referral code — credit reward to referrer's wallet

router.post('/referral/apply', authenticate, async (req: Request, res: Response) => {
  try {
    const referredUserId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'code is required' });
    }
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required' });
    }

    // Find referral code
    const referralCode = await ReferralCode.findOne({
      code: (code as string).toUpperCase(),
      restaurantId,
      isActive: true,
    });
    if (!referralCode) {
      return res.status(404).json({ error: 'Invalid or expired referral code' });
    }

    // Prevent self-referral
    if (referralCode.userId.toString() === referredUserId) {
      return res.status(400).json({ error: 'You cannot use your own referral code' });
    }

    // Check max usage
    if (referralCode.maxUsage !== -1 && referralCode.usageCount >= referralCode.maxUsage) {
      return res.status(400).json({ error: 'This referral code has reached its maximum usage' });
    }

    // Check if this user already used a referral code for this restaurant
    const alreadyUsed = await ReferralUse.exists({ referredUserId, restaurantId });
    if (alreadyUsed) {
      return res.status(400).json({ error: 'You have already used a referral code for this restaurant' });
    }

    const referrerId = referralCode.userId.toString();
    const rewardAmount = referralCode.rewardPerReferral;

    // Create referral use record
    await ReferralUse.create({
      referralCodeId: referralCode._id,
      referrerId,
      referredUserId,
      restaurantId,
      status: 'rewarded',
      rewardAmount,
    });

    // Increment usage count
    referralCode.usageCount += 1;
    await referralCode.save();

    // Credit reward to referrer's wallet
    const referrerWallet = await getOrCreateWallet(referrerId, restaurantId);
    const balanceBefore = referrerWallet.balance;
    referrerWallet.balance = parseFloat((referrerWallet.balance + rewardAmount).toFixed(2));
    await referrerWallet.save();

    await WalletTransaction.create({
      walletId: referrerWallet._id,
      userId: referrerId,
      restaurantId,
      type: 'credit',
      amount: rewardAmount,
      source: 'referral',
      description: `Referral reward for inviting user ${referredUserId}`,
      referenceId: referralCode.code,
      balanceBefore,
      balanceAfter: referrerWallet.balance,
    });

    return res.json({
      message: `Referral applied successfully. ₹${rewardAmount} credited to referrer.`,
      rewardAmount,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to apply referral code' });
  }
});

export default router;
