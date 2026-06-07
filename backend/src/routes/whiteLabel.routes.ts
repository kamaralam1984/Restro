import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import WhiteLabel from '../models/WhiteLabel.model';

const router = Router();

// ── GET /white-label/me — get (or create) white label config ──────────────────
router.get(
  '/white-label/me',
  authenticate,
  requireAdminOrSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const restaurantId = (req as any).user.restaurantId;
      if (!restaurantId) {
        return res.status(400).json({ error: 'No restaurantId on token' });
      }

      let config = await WhiteLabel.findOne({ restaurantId }).lean();

      if (!config) {
        // Create with defaults
        await WhiteLabel.create({
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          agencyName: 'My Agency',
          brandColor: '#c8972a',
          brandColorSecondary: '#080808',
          hideRestroOSBranding: false,
          status: 'active',
          resellerClients: [],
        });
        config = await WhiteLabel.findOne({ restaurantId }).lean();
      }

      res.json({ config });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch white label config' });
    }
  }
);

// ── PUT /white-label/me — update white label config ───────────────────────────
router.put(
  '/white-label/me',
  authenticate,
  requireAdminOrSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const restaurantId = (req as any).user.restaurantId;
      if (!restaurantId) {
        return res.status(400).json({ error: 'No restaurantId on token' });
      }

      const allowedFields = [
        'agencyName',
        'customDomain',
        'brandColor',
        'brandColorSecondary',
        'logoUrl',
        'faviconUrl',
        'customCSS',
        'emailFromName',
        'emailFromAddress',
        'smtpHost',
        'smtpPort',
        'smtpUser',
        'smtpPass',
        'customLoginMessage',
        'hideRestroOSBranding',
        'status',
      ];

      const update: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          update[field] = req.body[field];
        }
      }

      const config = await WhiteLabel.findOneAndUpdate(
        { restaurantId },
        { $set: update },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();

      res.json({ config, message: 'White label config updated' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update white label config' });
    }
  }
);

// ── POST /white-label/clients — add reseller client ───────────────────────────
router.post(
  '/white-label/clients',
  authenticate,
  requireAdminOrSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const restaurantId = (req as any).user.restaurantId;
      if (!restaurantId) {
        return res.status(400).json({ error: 'No restaurantId on token' });
      }

      const { name, email, plan } = req.body;
      if (!name || !email || !plan) {
        return res.status(400).json({ error: 'name, email, and plan are required' });
      }

      // Check duplicate email
      const existing = await WhiteLabel.findOne({
        restaurantId,
        'resellerClients.email': email.toLowerCase().trim(),
      });
      if (existing) {
        return res.status(409).json({ error: 'A client with this email already exists' });
      }

      const config = await WhiteLabel.findOneAndUpdate(
        { restaurantId },
        {
          $push: {
            resellerClients: {
              name: name.trim(),
              email: email.toLowerCase().trim(),
              plan: plan.trim(),
              status: 'active',
              addedAt: new Date(),
            },
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();

      res.status(201).json({ config, message: 'Reseller client added' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add reseller client' });
    }
  }
);

// ── DELETE /white-label/clients/:email — remove reseller client ───────────────
router.delete(
  '/white-label/clients/:email',
  authenticate,
  requireAdminOrSuperAdmin,
  async (req: Request, res: Response) => {
    try {
      const restaurantId = (req as any).user.restaurantId;
      if (!restaurantId) {
        return res.status(400).json({ error: 'No restaurantId on token' });
      }

      const emailParam = decodeURIComponent(req.params.email).toLowerCase().trim();

      const config = await WhiteLabel.findOneAndUpdate(
        { restaurantId },
        { $pull: { resellerClients: { email: emailParam } } },
        { new: true }
      ).lean();

      if (!config) {
        return res.status(404).json({ error: 'White label config not found' });
      }

      res.json({ config, message: 'Reseller client removed' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to remove reseller client' });
    }
  }
);

export default router;
