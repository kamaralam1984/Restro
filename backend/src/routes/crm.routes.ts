import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import { Lead, Campaign } from '../models/CRM.model';

const router = Router();

// All CRM routes require authentication + admin/superadmin
router.use(authenticate, requireAdminOrSuperAdmin);

// ─── Helper: get restaurantId from token ─────────────────────────────────────

function getRestaurantId(req: Request): mongoose.Types.ObjectId | null {
  const rid = req.user?.restaurantId;
  if (!rid) return null;
  return new mongoose.Types.ObjectId(rid);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEADS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /crm/leads — list leads (filter by status, source)
router.get('/leads', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId missing from token' });

    const filter: any = { restaurantId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.source) filter.source = req.query.source;

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    return res.json(leads);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /crm/leads — create lead
router.post('/leads', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId missing from token' });

    const lead = await Lead.create({ ...req.body, restaurantId });
    return res.status(201).json(lead);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /crm/leads/:id — update lead
router.put('/leads/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId missing from token' });

    const { status, notes, followUpDate, assignedTo, tags, name, phone, email, source } = req.body;
    const update: any = {};
    if (status !== undefined) update.status = status;
    if (notes !== undefined) update.notes = notes;
    if (followUpDate !== undefined) update.followUpDate = followUpDate;
    if (assignedTo !== undefined) update.assignedTo = assignedTo;
    if (tags !== undefined) update.tags = tags;
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (email !== undefined) update.email = email;
    if (source !== undefined) update.source = source;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    return res.json(lead);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /crm/leads/:id — delete lead
router.delete('/leads/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId missing from token' });

    const lead = await Lead.findOneAndDelete({ _id: req.params.id, restaurantId });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    return res.json({ message: 'Lead deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAMPAIGNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /crm/campaigns — list campaigns
router.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId missing from token' });

    const filter: any = { restaurantId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });
    return res.json(campaigns);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /crm/campaigns — create campaign
router.post('/campaigns', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId missing from token' });

    const campaign = await Campaign.create({ ...req.body, restaurantId });
    return res.status(201).json(campaign);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /crm/campaigns/:id — update campaign
router.put('/campaigns/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId missing from token' });

    const allowedFields = [
      'name', 'type', 'status', 'targetSegment', 'message',
      'subject', 'scheduledAt', 'recipientCount', 'deliveredCount', 'openedCount',
    ];
    const update: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    return res.json(campaign);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /crm/campaigns/:id/send — send campaign
router.post('/campaigns/:id/send', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId missing from token' });

    const campaign = await Campaign.findOne({ _id: req.params.id, restaurantId });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (campaign.status === 'sent') {
      return res.status(400).json({ error: 'Campaign already sent' });
    }

    campaign.status = 'sent';
    campaign.sentAt = new Date();
    // Simulate delivery: mark all recipients as delivered
    if (campaign.recipientCount > 0) {
      campaign.deliveredCount = campaign.recipientCount;
    }
    await campaign.save();

    return res.json({ message: 'Campaign sent successfully', campaign });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /crm/campaigns/:id — delete campaign
router.delete('/campaigns/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId missing from token' });

    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, restaurantId });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    return res.json({ message: 'Campaign deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /crm/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId missing from token' });

    const [
      totalLeads,
      newLeads,
      converted,
      totalCampaigns,
      recipientAgg,
    ] = await Promise.all([
      Lead.countDocuments({ restaurantId }),
      Lead.countDocuments({ restaurantId, status: 'new' }),
      Lead.countDocuments({ restaurantId, status: 'converted' }),
      Campaign.countDocuments({ restaurantId }),
      Campaign.aggregate([
        { $match: { restaurantId } },
        { $group: { _id: null, total: { $sum: '$recipientCount' } } },
      ]),
    ]);

    const totalRecipients = recipientAgg[0]?.total ?? 0;

    return res.json({ totalLeads, newLeads, converted, totalCampaigns, totalRecipients });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
