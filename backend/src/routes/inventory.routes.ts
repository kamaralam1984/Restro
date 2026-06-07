import { Router, Request, Response } from 'express';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import { Ingredient, Vendor, PurchaseOrder } from '../models/Inventory.model';
import mongoose from 'mongoose';

const router = Router();

// All inventory routes require authentication and admin role
router.use(authenticate, requireAdminOrSuperAdmin);

// ─── Helper ───────────────────────────────────────────────────────────────────

function getRestaurantId(req: Request): string {
  return (req as any).user.restaurantId;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INGREDIENTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /ingredients — list (optional ?low=true for low stock items)
router.get('/ingredients', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { low, category } = req.query;

    const filter: any = { restaurantId, isActive: true };
    if (category) filter.category = category;

    const ingredients = await Ingredient.find(filter).sort({ name: 1 });

    if (low === 'true') {
      const lowStock = ingredients.filter(
        (ing) => ing.currentStock <= ing.minStock
      );
      return res.json(lowStock);
    }

    res.json(ingredients);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch ingredients' });
  }
});

// POST /ingredients — create ingredient
router.post('/ingredients', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { name, unit, currentStock, minStock, maxStock, costPerUnit, category, expiryDate } =
      req.body;

    const ingredient = new Ingredient({
      restaurantId,
      name,
      unit,
      currentStock: currentStock ?? 0,
      minStock: minStock ?? 0,
      maxStock: maxStock ?? 0,
      costPerUnit: costPerUnit ?? 0,
      category,
      expiryDate: expiryDate || undefined,
      isActive: true,
    });

    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create ingredient' });
  }
});

// PUT /ingredients/:id — update ingredient
router.put('/ingredients/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { id } = req.params;

    const ingredient = await Ingredient.findOneAndUpdate(
      { _id: id, restaurantId, isActive: true },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(ingredient);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update ingredient' });
  }
});

// DELETE /ingredients/:id — soft delete
router.delete('/ingredients/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { id } = req.params;

    const ingredient = await Ingredient.findOneAndUpdate(
      { _id: id, restaurantId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete ingredient' });
  }
});

// POST /ingredients/:id/adjust — adjust stock
router.post('/ingredients/:id/adjust', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { id } = req.params;
    const { quantity, type, reason } = req.body;

    if (!quantity || !type || !['add', 'remove'].includes(type)) {
      return res
        .status(400)
        .json({ error: 'quantity and type (add|remove) are required' });
    }

    const ingredient = await Ingredient.findOne({ _id: id, restaurantId, isActive: true });
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    if (type === 'add') {
      ingredient.currentStock += Number(quantity);
    } else {
      ingredient.currentStock = Math.max(0, ingredient.currentStock - Number(quantity));
    }

    await ingredient.save();
    res.json({ ingredient, reason });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to adjust stock' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// VENDORS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /vendors — list vendors
router.get('/vendors', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const vendors = await Vendor.find({ restaurantId, isActive: true }).sort({ name: 1 });
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch vendors' });
  }
});

// POST /vendors — create vendor
router.post('/vendors', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { name, phone, email, address, gstin, paymentTerms } = req.body;

    const vendor = new Vendor({
      restaurantId,
      name,
      phone,
      email,
      address,
      gstin: gstin || undefined,
      paymentTerms: paymentTerms || 'Net 30',
      isActive: true,
    });

    await vendor.save();
    res.status(201).json(vendor);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create vendor' });
  }
});

// PUT /vendors/:id — update vendor
router.put('/vendors/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { id } = req.params;

    const vendor = await Vendor.findOneAndUpdate(
      { _id: id, restaurantId, isActive: true },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update vendor' });
  }
});

// DELETE /vendors/:id — soft delete
router.delete('/vendors/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { id } = req.params;

    const vendor = await Vendor.findOneAndUpdate(
      { _id: id, restaurantId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete vendor' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /purchase-orders — list purchase orders
router.get('/purchase-orders', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { status } = req.query;

    const filter: any = { restaurantId };
    if (status) filter.status = status;

    const orders = await PurchaseOrder.find(filter)
      .populate('vendorId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch purchase orders' });
  }
});

// POST /purchase-orders — create purchase order
router.post('/purchase-orders', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { vendorId, items, notes } = req.body;

    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'vendorId and items are required' });
    }

    // Calculate totals per item and overall
    const processedItems = items.map((item: any) => ({
      ingredientId: item.ingredientId,
      name: item.name,
      quantity: Number(item.quantity),
      unit: item.unit,
      costPerUnit: Number(item.costPerUnit),
      total: Number(item.quantity) * Number(item.costPerUnit),
    }));

    const totalAmount = processedItems.reduce((sum, item) => sum + item.total, 0);

    const po = new PurchaseOrder({
      restaurantId,
      vendorId,
      items: processedItems,
      status: 'pending',
      totalAmount,
      notes: notes || undefined,
    });

    await po.save();
    const populated = await po.populate('vendorId', 'name phone email');
    res.status(201).json(populated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create purchase order' });
  }
});

// PUT /purchase-orders/:id/status — update PO status
router.put('/purchase-orders/:id/status', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'ordered', 'received', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const po = await PurchaseOrder.findOne({ _id: id, restaurantId });
    if (!po) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Prevent invalid transitions
    if (po.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot update a cancelled order' });
    }
    if (po.status === 'received') {
      return res.status(400).json({ error: 'Order already received' });
    }

    po.status = status;
    if (status === 'ordered') po.orderedAt = new Date();
    if (status === 'received') po.receivedAt = new Date();

    // When received: increment each ingredient's stock
    if (status === 'received') {
      const bulkOps = po.items.map((item) => ({
        updateOne: {
          filter: {
            _id: item.ingredientId,
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
          },
          update: { $inc: { currentStock: item.quantity } },
        },
      }));

      if (bulkOps.length > 0) {
        await Ingredient.bulkWrite(bulkOps);
      }
    }

    await po.save();
    const populated = await po.populate('vendorId', 'name phone email');
    res.json(populated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update purchase order status' });
  }
});

export default router;
