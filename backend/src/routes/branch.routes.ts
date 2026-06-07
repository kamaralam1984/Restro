import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import { Branch, BranchMetric } from '../models/Branch.model';

const router = Router();

router.use(authenticate, requireAdminOrSuperAdmin);

function getRestaurantId(req: Request): string {
  return (req as any).user.restaurantId;
}

// ─── GET /branches/summary ────────────────────────────────────────────────────
// Must be declared before /:id to avoid route conflict
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);

    const branches = await Branch.find({
      parentRestaurantId,
      status: { $ne: 'inactive' },
    }).lean();

    const totalBranches = branches.length;
    const totalRevenue = branches.reduce((s, b) => s + (b.monthlyRevenue || 0), 0);
    const totalOrders = branches.reduce((s, b) => s + (b.totalOrders || 0), 0);

    let topBranch = null;
    if (branches.length > 0) {
      const top = branches.reduce((prev, cur) =>
        (cur.monthlyRevenue || 0) > (prev.monthlyRevenue || 0) ? cur : prev
      );
      topBranch = { name: top.name, city: top.city, revenue: top.monthlyRevenue };
    }

    res.json({ totalBranches, totalRevenue, totalOrders, topBranch });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /branches ────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);
    const { status, city } = req.query;

    const filter: any = { parentRestaurantId };
    if (status) filter.status = status;
    if (city) filter.city = { $regex: city, $options: 'i' };

    const branches = await Branch.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ branches, total: branches.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /branches ───────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);
    const {
      name, address, city, phone, email,
      managerName, managerPhone, status,
      openingTime, closingTime, features,
    } = req.body;

    if (!name || !address || !city || !phone || !email) {
      return res.status(400).json({ error: 'name, address, city, phone, email are required' });
    }

    const branch = new Branch({
      parentRestaurantId,
      name, address, city, phone, email,
      managerName, managerPhone,
      status: status || 'setup',
      openingTime: openingTime || '09:00',
      closingTime: closingTime || '22:00',
      features: features || { onlineOrdering: false, tableBooking: false, delivery: false },
    });

    await branch.save();
    res.status(201).json(branch);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── PUT /branches/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);
    const allowedFields = [
      'name', 'address', 'city', 'phone', 'email',
      'managerName', 'managerPhone', 'status',
      'monthlyRevenue', 'totalOrders', 'avgRating',
      'openingTime', 'closingTime', 'features',
    ];

    const update: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, parentRestaurantId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json(branch);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── DELETE /branches/:id — soft delete ──────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, parentRestaurantId },
      { $set: { status: 'inactive' } },
      { new: true }
    );
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json({ message: 'Branch deactivated', branch });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /branches/:id/metrics ────────────────────────────────────────────────
router.get('/:id/metrics', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);

    // Verify branch belongs to this restaurant
    const branch = await Branch.findOne({
      _id: req.params.id,
      parentRestaurantId,
    }).lean();
    if (!branch) return res.status(404).json({ error: 'Branch not found' });

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const metrics = await BranchMetric.find({
      branchId: new mongoose.Types.ObjectId(req.params.id),
      date: { $gte: since },
    })
      .sort({ date: 1 })
      .lean();

    // Aggregate totals
    const totalOrders = metrics.reduce((s, m) => s + m.orders, 0);
    const totalRevenue = metrics.reduce((s, m) => s + m.revenue, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const newCustomers = metrics.reduce((s, m) => s + m.newCustomers, 0);

    res.json({
      branch,
      metrics,
      summary: { totalOrders, totalRevenue, avgOrderValue, newCustomers },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
