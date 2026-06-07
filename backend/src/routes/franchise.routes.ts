import { Router, Request, Response } from 'express';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import { Franchisee, RoyaltyPayment } from '../models/Franchise.model';

const router = Router();

router.use(authenticate, requireAdminOrSuperAdmin);

function getRestaurantId(req: Request): string {
  return (req as any).user.restaurantId;
}

// ─── GET /franchise/stats ─────────────────────────────────────────────────────
// Must be declared before /:id routes
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);

    const franchisees = await Franchisee.find({ parentRestaurantId }).lean();
    const totalFranchisees = franchisees.length;
    const active = franchisees.filter((f) => f.status === 'active').length;
    const totalRevenue = franchisees.reduce((s, f) => s + (f.totalRevenue || 0), 0);
    const totalRoyaltyDue = franchisees.reduce((s, f) => s + (f.royaltyDue || 0), 0);
    const totalRoyaltyPaid = franchisees.reduce((s, f) => s + (f.royaltyPaid || 0), 0);

    res.json({ totalFranchisees, active, totalRevenue, totalRoyaltyDue, totalRoyaltyPaid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /franchisees ─────────────────────────────────────────────────────────
router.get('/franchisees', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);
    const { status, city } = req.query;

    const filter: any = { parentRestaurantId };
    if (status) filter.status = status;
    if (city) filter.city = { $regex: city, $options: 'i' };

    const franchisees = await Franchisee.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ franchisees, total: franchisees.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /franchisees ────────────────────────────────────────────────────────
router.post('/franchisees', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);
    const {
      franchiseeName, ownerName, ownerPhone, ownerEmail,
      city, address, status, royaltyType, royaltyValue,
      contractStartDate, contractEndDate, notes,
    } = req.body;

    if (!franchiseeName || !ownerName || !ownerPhone || !ownerEmail || !city || !address) {
      return res.status(400).json({
        error: 'franchiseeName, ownerName, ownerPhone, ownerEmail, city, address are required',
      });
    }

    const franchisee = new Franchisee({
      parentRestaurantId,
      franchiseeName, ownerName, ownerPhone, ownerEmail,
      city, address,
      status: status || 'prospect',
      royaltyType: royaltyType || 'percentage',
      royaltyValue: Number(royaltyValue) || 0,
      contractStartDate: contractStartDate ? new Date(contractStartDate) : undefined,
      contractEndDate: contractEndDate ? new Date(contractEndDate) : undefined,
      notes,
    });

    await franchisee.save();
    res.status(201).json(franchisee);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── PUT /franchisees/:id ─────────────────────────────────────────────────────
router.put('/franchisees/:id', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);
    const allowedFields = [
      'franchiseeName', 'ownerName', 'ownerPhone', 'ownerEmail',
      'city', 'address', 'status', 'royaltyType', 'royaltyValue',
      'contractStartDate', 'contractEndDate', 'totalRevenue',
      'royaltyPaid', 'royaltyDue', 'notes',
    ];

    const update: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'contractStartDate' || field === 'contractEndDate') {
          update[field] = req.body[field] ? new Date(req.body[field]) : undefined;
        } else {
          update[field] = req.body[field];
        }
      }
    }

    const franchisee = await Franchisee.findOneAndUpdate(
      { _id: req.params.id, parentRestaurantId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!franchisee) return res.status(404).json({ error: 'Franchisee not found' });
    res.json(franchisee);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── GET /royalties ───────────────────────────────────────────────────────────
router.get('/royalties', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);
    const { month, status, franchiseeId } = req.query;

    const filter: any = { parentRestaurantId };
    if (month) filter.periodMonth = month;
    if (status) filter.status = status;
    if (franchiseeId) filter.franchiseeId = franchiseeId;

    const payments = await RoyaltyPayment.find(filter)
      .populate('franchiseeId', 'franchiseeName ownerName city')
      .sort({ periodMonth: -1, createdAt: -1 })
      .lean();

    const totalDue = payments
      .filter((p) => p.status === 'pending')
      .reduce((s, p) => s + p.amount, 0);

    const totalPaid = payments
      .filter((p) => p.status === 'paid')
      .reduce((s, p) => s + p.amount, 0);

    res.json({ payments, totalDue, totalPaid, total: payments.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /royalties ──────────────────────────────────────────────────────────
router.post('/royalties', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);
    const { franchiseeId, amount, periodMonth, status, notes } = req.body;

    if (!franchiseeId || !amount || !periodMonth) {
      return res.status(400).json({ error: 'franchiseeId, amount, periodMonth are required' });
    }

    // Verify franchisee belongs to this restaurant
    const franchisee = await Franchisee.findOne({ _id: franchiseeId, parentRestaurantId }).lean();
    if (!franchisee) return res.status(404).json({ error: 'Franchisee not found' });

    const payment = new RoyaltyPayment({
      franchiseeId,
      parentRestaurantId,
      amount: Number(amount),
      periodMonth,
      status: status || 'pending',
      notes,
    });

    await payment.save();

    // Update royaltyDue on franchisee
    if (payment.status === 'pending') {
      await Franchisee.findByIdAndUpdate(franchiseeId, {
        $inc: { royaltyDue: Number(amount) },
      });
    }

    res.status(201).json(payment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── PUT /royalties/:id/pay ───────────────────────────────────────────────────
router.put('/royalties/:id/pay', async (req: Request, res: Response) => {
  try {
    const parentRestaurantId = getRestaurantId(req);
    const { notes } = req.body;

    const payment = await RoyaltyPayment.findOne({
      _id: req.params.id,
      parentRestaurantId,
      status: 'pending',
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pending royalty payment not found' });
    }

    payment.status = 'paid';
    payment.paidAt = new Date();
    if (notes) payment.notes = notes;
    await payment.save();

    // Update franchisee royalty tracking
    await Franchisee.findByIdAndUpdate(payment.franchiseeId, {
      $inc: { royaltyPaid: payment.amount, royaltyDue: -payment.amount },
    });

    res.json(payment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
