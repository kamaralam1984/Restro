import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import AbandonedCart from '../models/AbandonedCart.model';

const router = Router();

// ── GET / — list abandoned carts ─────────────────────────────────────────────
router.get('/', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { status, date } = req.query as { status?: string; date?: string };

    const filter: Record<string, any> = { restaurantId };

    if (status && ['pending', 'reminder_sent', 'recovered', 'ignored'].includes(status)) {
      filter.status = status;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const carts = await AbandonedCart.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ carts, total: carts.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch abandoned carts' });
  }
});

// ── POST / — create abandoned cart record ─────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      restaurantId,
      customerPhone,
      customerEmail,
      customerName,
      items,
      cartTotal,
      tableNumber,
      slug,
      source,
    } = req.body;

    if (!restaurantId || !customerPhone || !items || !cartTotal || !slug) {
      return res.status(400).json({ error: 'Missing required fields: restaurantId, customerPhone, items, cartTotal, slug' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    const cart = await AbandonedCart.create({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      customerPhone,
      customerEmail,
      customerName,
      items,
      cartTotal,
      tableNumber,
      slug,
      source: source || 'qr_order',
      status: 'pending',
      reminderCount: 0,
    });

    res.status(201).json({ cart });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create abandoned cart' });
  }
});

// ── PUT /:id/status — update status ──────────────────────────────────────────
router.put('/:id/status', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'reminder_sent', 'recovered', 'ignored'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const update: Record<string, any> = { status };
    if (status === 'recovered') update.recoveredAt = new Date();
    if (status === 'reminder_sent') update.reminderSentAt = new Date();

    const cart = await AbandonedCart.findOneAndUpdate(
      { _id: id, restaurantId },
      { $set: update },
      { new: true }
    );

    if (!cart) return res.status(404).json({ error: 'Abandoned cart not found' });

    res.json({ cart });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update status' });
  }
});

// ── POST /:id/remind — mark reminder sent + increment count ──────────────────
router.post('/:id/remind', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;

    const cart = await AbandonedCart.findOneAndUpdate(
      { _id: id, restaurantId },
      {
        $set: { status: 'reminder_sent', reminderSentAt: new Date() },
        $inc: { reminderCount: 1 },
      },
      { new: true }
    );

    if (!cart) return res.status(404).json({ error: 'Abandoned cart not found' });

    res.json({ cart, message: 'Reminder marked as sent' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark reminder' });
  }
});

// ── GET /stats — recovery stats ───────────────────────────────────────────────
router.get('/stats', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const restaurantId = (req as any).user.restaurantId;

    const [totals, dailyData] = await Promise.all([
      AbandonedCart.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$cartTotal' },
          },
        },
      ]),
      AbandonedCart.aggregate([
        {
          $match: {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              status: '$status',
            },
            count: { $sum: 1 },
            value: { $sum: '$cartTotal' },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),
    ]);

    const statsMap: Record<string, { count: number; totalValue: number }> = {};
    for (const row of totals) {
      statsMap[row._id] = { count: row.count, totalValue: row.totalValue };
    }

    const total = Object.values(statsMap).reduce((s, v) => s + v.count, 0);
    const pending = statsMap['pending']?.count || 0;
    const reminderSent = statsMap['reminder_sent']?.count || 0;
    const recovered = statsMap['recovered']?.count || 0;
    const ignored = statsMap['ignored']?.count || 0;

    const totalValue = Object.values(statsMap).reduce((s, v) => s + v.totalValue, 0);
    const recoveredValue = statsMap['recovered']?.totalValue || 0;
    const recoveryRate = total > 0 ? parseFloat(((recovered / total) * 100).toFixed(2)) : 0;
    const avgCartValue = total > 0 ? parseFloat((totalValue / total).toFixed(2)) : 0;

    // Top abandoned items
    const topItems = await AbandonedCart.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), status: { $ne: 'recovered' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          count: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      total,
      pending,
      reminderSent,
      recovered,
      ignored,
      totalValue,
      recoveredValue,
      recoveryRate,
      avgCartValue,
      dailyData,
      topItems,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
});

export default router;
