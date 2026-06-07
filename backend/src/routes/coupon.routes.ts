import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import Coupon from '../models/Coupon.model';
import { Restaurant } from '../models/Restaurant.model';

const router = Router();

// ─────────────────────────────────────────────
// GET /api/coupons — list all coupons for the restaurant
// ─────────────────────────────────────────────
router.get('/', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;
    const restaurantId = admin.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant context not found' });
    }

    const coupons = await Coupon.find({ restaurantId }).sort({ createdAt: -1 });
    return res.json({ success: true, coupons });
  } catch (err: any) {
    console.error('[GET /api/coupons]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// POST /api/coupons — create a new coupon
// ─────────────────────────────────────────────
router.post('/', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;
    const restaurantId = admin.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant context not found' });
    }

    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit,
      isActive,
      validFrom,
      validUntil,
      description,
    } = req.body;

    // Basic validation
    if (!code || !type || value === undefined || !validFrom || !validUntil) {
      return res.status(400).json({ success: false, message: 'Missing required fields: code, type, value, validFrom, validUntil' });
    }

    if (!['percentage', 'flat', 'free_delivery'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid coupon type' });
    }

    if (new Date(validFrom) >= new Date(validUntil)) {
      return res.status(400).json({ success: false, message: 'validFrom must be before validUntil' });
    }

    const coupon = new Coupon({
      restaurantId,
      code: String(code).toUpperCase().trim(),
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount ?? 0),
      maxDiscount: maxDiscount !== undefined ? Number(maxDiscount) : undefined,
      usageLimit: usageLimit !== undefined ? Number(usageLimit) : -1,
      usedCount: 0,
      perUserLimit: perUserLimit !== undefined ? Number(perUserLimit) : 1,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      description: description || undefined,
    });

    await coupon.save();
    return res.status(201).json({ success: true, coupon });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists for this restaurant' });
    }
    console.error('[POST /api/coupons]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/coupons/:id — update a coupon
// ─────────────────────────────────────────────
router.put('/:id', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;
    const restaurantId = admin.restaurantId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
    }

    const coupon = await Coupon.findOne({ _id: id, restaurantId });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const allowedFields = [
      'type', 'value', 'minOrderAmount', 'maxDiscount',
      'usageLimit', 'perUserLimit', 'isActive',
      'validFrom', 'validUntil', 'description',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'validFrom' || field === 'validUntil') {
          (coupon as any)[field] = new Date(req.body[field]);
        } else {
          (coupon as any)[field] = req.body[field];
        }
      }
    }

    // Allow code update but keep it uppercase
    if (req.body.code !== undefined) {
      coupon.code = String(req.body.code).toUpperCase().trim();
    }

    await coupon.save();
    return res.json({ success: true, coupon });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists for this restaurant' });
    }
    console.error('[PUT /api/coupons/:id]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/coupons/:id — delete a coupon
// ─────────────────────────────────────────────
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;
    const restaurantId = admin.restaurantId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid coupon ID' });
    }

    const coupon = await Coupon.findOneAndDelete({ _id: id, restaurantId });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    return res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    console.error('[DELETE /api/coupons/:id]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// POST /api/coupons/validate — public route; validate coupon code
// body: { code, restaurantId, cartTotal }
// ─────────────────────────────────────────────
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, restaurantId, cartTotal } = req.body;

    if (!code || !restaurantId || cartTotal === undefined) {
      return res.status(400).json({ valid: false, message: 'code, restaurantId, and cartTotal are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ valid: false, message: 'Invalid restaurantId' });
    }

    // Verify the restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ valid: false, message: 'Restaurant not found' });
    }

    // Find the coupon
    const coupon = await Coupon.findOne({
      restaurantId,
      code: String(code).toUpperCase().trim(),
    });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
    }

    // Check isActive
    if (!coupon.isActive) {
      return res.json({ valid: false, message: 'This coupon is inactive' });
    }

    // Check date range
    const now = new Date();
    if (now < coupon.validFrom) {
      return res.json({ valid: false, message: 'Coupon is not yet valid' });
    }
    if (now > coupon.validUntil) {
      return res.json({ valid: false, message: 'Coupon has expired' });
    }

    // Check usage limit
    if (coupon.usageLimit !== -1 && coupon.usedCount >= coupon.usageLimit) {
      return res.json({ valid: false, message: 'Coupon usage limit reached' });
    }

    // Check minimum order amount
    const total = Number(cartTotal);
    if (total < coupon.minOrderAmount) {
      return res.json({
        valid: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required to use this coupon`,
      });
    }

    // Calculate discount
    let discount = 0;

    if (coupon.type === 'percentage') {
      discount = (total * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'flat') {
      discount = coupon.value;
      if (discount > total) {
        discount = total; // can't discount more than the cart total
      }
    } else if (coupon.type === 'free_delivery') {
      discount = coupon.value; // value = delivery fee amount waived
    }

    discount = Math.round(discount * 100) / 100; // round to 2 decimals

    return res.json({
      valid: true,
      discount,
      type: coupon.type,
      couponId: coupon._id,
      message: 'Coupon applied!',
    });
  } catch (err: any) {
    console.error('[POST /api/coupons/validate]', err);
    return res.status(500).json({ valid: false, message: 'Server error' });
  }
});

export default router;
