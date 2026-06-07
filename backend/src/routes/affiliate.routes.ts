import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import { Affiliate, AffiliateConversion } from '../models/Affiliate.model';

const router = Router();

// ── GET /affiliates — list affiliates ────────────────────────────────────────
router.get('/affiliates', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { status } = req.query as { status?: string };

    const filter: Record<string, any> = { restaurantId };
    if (status && ['active', 'inactive', 'pending'].includes(status)) {
      filter.status = status;
    }

    const affiliates = await Affiliate.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ affiliates, total: affiliates.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch affiliates' });
  }
});

// ── POST /affiliates — create affiliate ───────────────────────────────────────
router.post('/affiliates', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { name, email, phone, code, commissionType, commissionValue, payoutMethod, payoutDetails, notes } = req.body;

    if (!name || !email || !phone || !code || !commissionType || commissionValue === undefined || !payoutMethod || !payoutDetails) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check code uniqueness within restaurant
    const existing = await Affiliate.findOne({ restaurantId, code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ error: 'Affiliate code already exists for this restaurant' });
    }

    const affiliate = await Affiliate.create({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      name,
      email,
      phone,
      code: code.toUpperCase(),
      commissionType,
      commissionValue,
      payoutMethod,
      payoutDetails,
      notes,
      status: 'active',
    });

    res.status(201).json({ affiliate });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Affiliate code already exists for this restaurant' });
    }
    res.status(500).json({ error: err.message || 'Failed to create affiliate' });
  }
});

// ── PUT /affiliates/:id — update affiliate ────────────────────────────────────
router.put('/affiliates/:id', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;

    const allowedFields = ['name', 'email', 'phone', 'commissionType', 'commissionValue', 'payoutMethod', 'payoutDetails', 'notes', 'status'];
    const update: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const affiliate = await Affiliate.findOneAndUpdate(
      { _id: id, restaurantId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });
    res.json({ affiliate });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update affiliate' });
  }
});

// ── DELETE /affiliates/:id — delete affiliate ─────────────────────────────────
router.delete('/affiliates/:id', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;

    const affiliate = await Affiliate.findOneAndDelete({ _id: id, restaurantId });
    if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });

    // Also remove conversions for this affiliate
    await AffiliateConversion.deleteMany({ affiliateId: id, restaurantId });

    res.json({ message: 'Affiliate deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete affiliate' });
  }
});

// ── GET /affiliates/stats — summary stats ─────────────────────────────────────
router.get('/affiliates/stats', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const rid = new mongoose.Types.ObjectId(restaurantId);

    const [affiliateStats, conversionStats, pendingPayout] = await Promise.all([
      Affiliate.aggregate([
        { $match: { restaurantId: rid } },
        {
          $group: {
            _id: null,
            totalAffiliates: { $sum: 1 },
            totalEarned: { $sum: '$totalEarned' },
            totalOrders: { $sum: '$totalOrders' },
          },
        },
      ]),
      AffiliateConversion.aggregate([
        { $match: { restaurantId: rid } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$commissionAmount' },
            count: { $sum: 1 },
          },
        },
      ]),
      AffiliateConversion.aggregate([
        { $match: { restaurantId: rid, status: { $in: ['pending', 'approved'] } } },
        { $group: { _id: null, pendingPayout: { $sum: '$commissionAmount' } } },
      ]),
    ]);

    const aStats = affiliateStats[0] || { totalAffiliates: 0, totalEarned: 0, totalOrders: 0 };
    const payout = pendingPayout[0]?.pendingPayout || 0;

    res.json({
      totalAffiliates: aStats.totalAffiliates,
      totalEarned: aStats.totalEarned,
      totalOrders: aStats.totalOrders,
      pendingPayout: payout,
      conversionBreakdown: conversionStats,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch affiliate stats' });
  }
});

// ── GET /affiliates/conversions — list conversions ────────────────────────────
router.get('/affiliates/conversions', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { affiliateId, status } = req.query as { affiliateId?: string; status?: string };

    const filter: Record<string, any> = { restaurantId };
    if (affiliateId) filter.affiliateId = new mongoose.Types.ObjectId(affiliateId);
    if (status && ['pending', 'approved', 'paid'].includes(status)) filter.status = status;

    const conversions = await AffiliateConversion.find(filter)
      .sort({ createdAt: -1 })
      .populate('affiliateId', 'name code email')
      .populate('orderId', 'orderNumber total')
      .limit(500)
      .lean();

    const totalPending = conversions
      .filter((c) => c.status === 'pending')
      .reduce((s, c) => s + c.commissionAmount, 0);

    res.json({ conversions, total: conversions.length, totalPending });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch conversions' });
  }
});

// ── PUT /affiliates/conversions/:id/status — approve/pay conversion ───────────
router.put('/affiliates/conversions/:id/status', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'paid'].includes(status)) {
      return res.status(400).json({ error: 'status must be "approved" or "paid"' });
    }

    const conversion = await AffiliateConversion.findOneAndUpdate(
      { _id: id, restaurantId },
      { $set: { status } },
      { new: true }
    ).populate('affiliateId', 'name code');

    if (!conversion) return res.status(404).json({ error: 'Conversion not found' });

    // If marking paid, update affiliate's totalEarned is tracked separately via conversions
    res.json({ conversion, message: `Conversion marked as ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update conversion status' });
  }
});

export default router;
