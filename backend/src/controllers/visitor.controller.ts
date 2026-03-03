import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Visitor } from '../models/Visitor.model';
import { sendVisitorInfoEmail } from '../utils/email';

type TrackBody = {
  visitorId?: string;
  page: string;
  durationSec?: number;
  startedAt?: string;
  name?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
};

// Public endpoint: track anonymous visitor activity
export const trackVisitor = async (req: Request<unknown, unknown, TrackBody>, res: Response) => {
  try {
    const {
      visitorId,
      page,
      durationSec,
      startedAt,
      name,
      email,
      country,
      state,
      city,
      timezone,
      source,
      medium,
      campaign,
      referrer,
    } = req.body;

    if (!page) {
      return res.status(400).json({ error: 'Page is required' });
    }

    const sessionId =
      (visitorId && typeof visitorId === 'string' && visitorId.trim()) ||
      new mongoose.Types.ObjectId().toString();

    const now = new Date();
    const started = startedAt ? new Date(startedAt) : now;
    const duration = typeof durationSec === 'number' && durationSec > 0 ? durationSec : 0;

    let visitor = await Visitor.findOne({ sessionId });

    if (!visitor) {
      visitor = new Visitor({
        sessionId,
        name: name?.trim() || undefined,
        email: email?.trim().toLowerCase() || undefined,
        country: country?.trim() || undefined,
        state: state?.trim() || undefined,
        city: city?.trim() || undefined,
        timezone: timezone?.trim() || undefined,
        source: source?.trim() || undefined,
        medium: medium?.trim() || undefined,
        campaign: campaign?.trim() || undefined,
        referrer: referrer?.trim() || undefined,
        userAgent: req.headers['user-agent'],
        firstSeenAt: started,
        lastSeenAt: now,
        totalDurationSec: duration,
        pageViews: [
          {
            path: page,
            visits: 1,
            totalDurationSec: duration,
            lastVisitedAt: now,
          },
        ],
      });
    } else {
      visitor.lastSeenAt = now;
      visitor.totalDurationSec += duration;

      if (name && !visitor.name) visitor.name = name.trim();
      if (email && !visitor.email) visitor.email = email.trim().toLowerCase();
      if (country && !visitor.country) visitor.country = country.trim();
      if (state && !visitor.state) visitor.state = state.trim();
      if (city && !visitor.city) visitor.city = city.trim();
      if (timezone && !visitor.timezone) visitor.timezone = timezone.trim();
      if (source && !visitor.source) visitor.source = source.trim();
      if (medium && !visitor.medium) visitor.medium = medium.trim();
      if (campaign && !visitor.campaign) visitor.campaign = campaign.trim();
      if (referrer && !visitor.referrer) visitor.referrer = referrer.trim();

      const existingPage = visitor.pageViews.find((pv) => pv.path === page);
      if (existingPage) {
        existingPage.visits += 1;
        existingPage.totalDurationSec += duration;
        existingPage.lastVisitedAt = now;
      } else {
        visitor.pageViews.push({
          path: page,
          visits: 1,
          totalDurationSec: duration,
          lastVisitedAt: now,
        });
      }
    }

    const shouldSendInfoEmail = !!visitor.email && !visitor.autoInfoEmailSent;

    await visitor.save();

    if (shouldSendInfoEmail) {
      try {
        await sendVisitorInfoEmail({
          name: visitor.name,
          email: visitor.email!,
          country: visitor.country,
          state: visitor.state,
          city: visitor.city,
          lastSeenAt: visitor.lastSeenAt,
        });
        visitor.autoInfoEmailSent = true;
        await visitor.save();
      } catch (error) {
        console.error('Failed to send visitor info email:', (error as any)?.message);
      }
    }

    res.json({ visitorId: visitor.sessionId });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to track visitor' });
  }
};

// Super admin: list visitors
export const getVisitors = async (req: Request, res: Response) => {
  try {
    const { search, country, page = 1, limit = 50 } = req.query as {
      search?: string;
      country?: string;
      page?: string;
      limit?: string;
    };

    const filter: Record<string, any> = {};
    if (country) filter.country = country;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [visitors, total] = await Promise.all([
      Visitor.find(filter)
        .sort({ lastSeenAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Visitor.countDocuments(filter),
    ]);

    res.json({ visitors, total, page: pageNum, limit: limitNum });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch visitors' });
  }
};

export const getVisitorById = async (req: Request, res: Response) => {
  try {
    const visitor = await Visitor.findById(req.params.id).lean();
    if (!visitor) return res.status(404).json({ error: 'Visitor not found' });
    res.json(visitor);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch visitor' });
  }
};

export const sendVisitorInfo = async (req: Request, res: Response) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ error: 'Visitor not found' });
    if (!visitor.email) return res.status(400).json({ error: 'Visitor has no email' });

    await sendVisitorInfoEmail({
      name: visitor.name,
      email: visitor.email,
      country: visitor.country,
      state: visitor.state,
      city: visitor.city,
      lastSeenAt: visitor.lastSeenAt,
    });

    visitor.autoInfoEmailSent = true;
    await visitor.save();

    res.json({ message: 'Visitor info email sent' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
};

// ─── Super admin: aggregate visitor analytics ───────────────────────────────────

export const getVisitorAnalytics = async (req: Request, res: Response) => {
  try {
    const days = parseInt((req.query.days as string) || '30', 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    // High level stats
    const [totals] = await Visitor.aggregate([
      { $match: { lastSeenAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          visitors: { $sum: 1 },
          totalDurationSec: { $sum: '$totalDurationSec' },
          withEmail: {
            $sum: {
              $cond: [{ $and: [{ $ne: ['$email', null] }, { $ne: ['$email', ''] }] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Top pages
    const topPages = await Visitor.aggregate([
      { $match: { lastSeenAt: { $gte: since } } },
      { $unwind: '$pageViews' },
      {
        $group: {
          _id: '$pageViews.path',
          visits: { $sum: '$pageViews.visits' },
          totalDurationSec: { $sum: '$pageViews.totalDurationSec' },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          path: '$_id',
          visits: 1,
          totalDurationSec: 1,
        },
      },
    ]);

    // Country stats
    const byCountry = await Visitor.aggregate([
      { $match: { lastSeenAt: { $gte: since } } },
      {
        $group: {
          _id: {
            country: { $ifNull: ['$country', 'Unknown'] },
          },
          visitors: { $sum: 1 },
          totalDurationSec: { $sum: '$totalDurationSec' },
        },
      },
      { $sort: { visitors: -1 } },
      {
        $project: {
          _id: 0,
          country: '$_id.country',
          visitors: 1,
          totalDurationSec: 1,
        },
      },
    ]);

    // Hourly pattern (based on lastSeenAt local hour)
    const hourly = await Visitor.aggregate([
      { $match: { lastSeenAt: { $gte: since } } },
      {
        $group: {
          _id: { hour: { $hour: '$lastSeenAt' } },
          visitors: { $sum: 1 },
        },
      },
      { $sort: { '_id.hour': 1 } },
      {
        $project: {
          _id: 0,
          hour: '$_id.hour',
          visitors: 1,
        },
      },
    ]);

    // Traffic sources (UTM / inferred)
    const bySource = await Visitor.aggregate([
      { $match: { lastSeenAt: { $gte: since } } },
      {
        $group: {
          _id: {
            source: {
              $cond: [
                { $or: [{ $eq: ['$source', null] }, { $eq: ['$source', ''] }] },
                'Direct',
                '$source',
              ],
            },
          },
          visitors: { $sum: 1 },
        },
      },
      { $sort: { visitors: -1 } },
      {
        $project: {
          _id: 0,
          source: '$_id.source',
          visitors: 1,
        },
      },
    ]);

    const stats = totals || {
      visitors: 0,
      totalDurationSec: 0,
      withEmail: 0,
    };

    const avgSessionDuration =
      stats.visitors > 0 ? stats.totalDurationSec / stats.visitors : 0;

    res.json({
      period: days,
      totalVisitors: stats.visitors || 0,
      totalDurationSec: stats.totalDurationSec || 0,
      avgSessionDurationSec: avgSessionDuration,
      identifiableVisitors: stats.withEmail || 0,
      topPages,
      byCountry,
      hourly,
      bySource,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch visitor analytics' });
  }
};

// ─── Public: GeoIP lookup for current request IP ───────────────────────────────

export const getVisitorGeo = async (_req: Request, res: Response) => {
  try {
    // Use external GeoIP service; in dev this may resolve to local network
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      return res.json({ country: null, state: null, city: null });
    }
    const data: any = await response.json();
    const country = data.country_name || null;
    const state = data.region || null;
    const city = data.city || null;
    res.json({ country, state, city });
  } catch {
    res.json({ country: null, state: null, city: null });
  }
};

