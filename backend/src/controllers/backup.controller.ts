import { Request, Response } from 'express';
import { Restaurant } from '../models/Restaurant.model';
import { User } from '../models/User.model';
import { Menu } from '../models/Menu.model';
import { Order } from '../models/Order.model';
import { Bill } from '../models/Bill.model';
import { Booking } from '../models/Booking.model';
import { Table } from '../models/Table.model';
import { HeroImage } from '../models/HeroImage.model';
import { Subscription } from '../models/Subscription.model';
import { RentalPlan } from '../models/RentalPlan.model';
import { AuditLog } from '../models/AuditLog.model';
import mongoose from 'mongoose';
import { BackupSnapshot } from '../models/BackupSnapshot.model';
import { logger } from '../utils/logger';

type BackupScope = 'all' | 'restaurant';

interface BackupQuery {
  scope: BackupScope;
  restaurantId?: string;
}

export interface BackupData {
  meta: {
    createdAt: string;
    scope: BackupScope;
    restaurantId: string | null;
    restaurantCount: number;
  };
  restaurants: any[];
  users: any[];
  menus: any[];
  orders: any[];
  bills: any[];
  bookings: any[];
  tables: any[];
  heroImages: any[];
  subscriptions: any[];
  rentalPlans: any[];
  auditLogs: any[];
}

export async function buildBackup(scope: BackupScope = 'all', restaurantId?: string): Promise<BackupData> {
  const filterByRestaurant = (field: string) => {
    if (scope !== 'restaurant' || !restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return {};
    }
    return { [field]: new mongoose.Types.ObjectId(restaurantId) };
  };

  const [
    restaurants,
    users,
    menus,
    orders,
    bills,
    bookings,
    tables,
    heroImages,
    subscriptions,
    rentalPlans,
    auditLogs,
  ] = await Promise.all([
    scope === 'all' ? Restaurant.find({}).lean() : Restaurant.find({ _id: restaurantId }).lean(),
    User.find(scope === 'all' ? {} : filterByRestaurant('restaurantId')).lean(),
    Menu.find(scope === 'all' ? {} : filterByRestaurant('restaurantId')).lean(),
    Order.find(scope === 'all' ? {} : filterByRestaurant('restaurantId')).lean(),
    Bill.find(scope === 'all' ? {} : filterByRestaurant('restaurantId')).lean(),
    Booking.find(scope === 'all' ? {} : filterByRestaurant('restaurantId')).lean(),
    Table.find(scope === 'all' ? {} : filterByRestaurant('restaurantId')).lean(),
    HeroImage.find(scope === 'all' ? {} : filterByRestaurant('restaurantId')).lean(),
    Subscription.find(scope === 'all' ? {} : filterByRestaurant('restaurantId')).lean(),
    RentalPlan.find({}).lean(),
    AuditLog.find(scope === 'all' ? {} : filterByRestaurant('restaurantId')).limit(5000).lean(),
  ]);

  return {
    meta: {
      createdAt: new Date().toISOString(),
      scope,
      restaurantId: restaurantId || null,
      restaurantCount: restaurants.length,
    },
    restaurants,
    users,
    menus,
    orders,
    bills,
    bookings,
    tables,
    heroImages,
    subscriptions,
    rentalPlans,
    auditLogs,
  };
}

// ─── Super Admin: Export backup as JSON ─────────────────────────────────────────

export const exportBackup = async (req: Request, res: Response) => {
  try {
    const { scope = 'all', restaurantId } = req.query as BackupQuery;
    const backup = await buildBackup(scope, restaurantId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="restro-os-backup-${scope}-${new Date().toISOString().slice(0, 10)}.json"`
    );
    res.status(200).send(JSON.stringify(backup, null, 2));
  } catch (err: any) {
    console.error('Backup export failed:', err);
    res.status(500).json({ error: err.message || 'Failed to export backup' });
  }
};

// ─── Super Admin: Restore from backup JSON ──────────────────────────────────────

export const importBackup = async (req: Request, res: Response) => {
  try {
    const { dryRun } = req.query as { dryRun?: string };
    const payload = req.body as any;
    if (!payload || typeof payload !== 'object' || !payload.meta) {
      return res.status(400).json({ error: 'Invalid backup payload' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const opts = { session, ordered: false };

      if (Array.isArray(payload.restaurants) && payload.restaurants.length > 0) {
        const docs = payload.restaurants.map((r: any) => ({ updateOne: { filter: { _id: r._id }, update: r, upsert: true } }));
        await Restaurant.bulkWrite(docs, opts);
      }
      if (Array.isArray(payload.users) && payload.users.length > 0) {
        const docs = payload.users.map((u: any) => ({ updateOne: { filter: { _id: u._id }, update: u, upsert: true } }));
        await User.bulkWrite(docs, opts);
      }
      if (Array.isArray(payload.menus) && payload.menus.length > 0) {
        const docs = payload.menus.map((m: any) => ({ updateOne: { filter: { _id: m._id }, update: m, upsert: true } }));
        await Menu.bulkWrite(docs, opts);
      }
      if (Array.isArray(payload.orders) && payload.orders.length > 0) {
        const docs = payload.orders.map((o: any) => ({ updateOne: { filter: { _id: o._id }, update: o, upsert: true } }));
        await Order.bulkWrite(docs, opts);
      }
      if (Array.isArray(payload.bills) && payload.bills.length > 0) {
        const docs = payload.bills.map((b: any) => ({ updateOne: { filter: { _id: b._id }, update: b, upsert: true } }));
        await Bill.bulkWrite(docs, opts);
      }
      if (Array.isArray(payload.bookings) && payload.bookings.length > 0) {
        const docs = payload.bookings.map((b: any) => ({ updateOne: { filter: { _id: b._id }, update: b, upsert: true } }));
        await Booking.bulkWrite(docs, opts);
      }
      if (Array.isArray(payload.tables) && payload.tables.length > 0) {
        const docs = payload.tables.map((t: any) => ({ updateOne: { filter: { _id: t._id }, update: t, upsert: true } }));
        await Table.bulkWrite(docs, opts);
      }
      if (Array.isArray(payload.heroImages) && payload.heroImages.length > 0) {
        const docs = payload.heroImages.map((h: any) => ({ updateOne: { filter: { _id: h._id }, update: h, upsert: true } }));
        await HeroImage.bulkWrite(docs, opts);
      }
      if (Array.isArray(payload.subscriptions) && payload.subscriptions.length > 0) {
        const docs = payload.subscriptions.map((s: any) => ({ updateOne: { filter: { _id: s._id }, update: s, upsert: true } }));
        await Subscription.bulkWrite(docs, opts);
      }
      if (Array.isArray(payload.rentalPlans) && payload.rentalPlans.length > 0) {
        const docs = payload.rentalPlans.map((p: any) => ({ updateOne: { filter: { _id: p._id }, update: p, upsert: true } }));
        await RentalPlan.bulkWrite(docs, opts);
      }
      if (Array.isArray(payload.auditLogs) && payload.auditLogs.length > 0) {
        const docs = payload.auditLogs.map((a: any) => ({ updateOne: { filter: { _id: a._id }, update: a, upsert: true } }));
        await AuditLog.bulkWrite(docs, opts);
      }

      if (dryRun === 'true') {
        await session.abortTransaction();
        return res.json({ message: 'Dry run successful. No data was written.' });
      }

      await session.commitTransaction();
      res.json({ message: 'Backup imported successfully' });
    } catch (err: any) {
      await session.abortTransaction();
      console.error('Backup import failed:', err);
      res.status(500).json({ error: err.message || 'Failed to import backup' });
    } finally {
      session.endSession();
    }
  } catch (err: any) {
    console.error('Backup import outer error:', err);
    res.status(500).json({ error: err.message || 'Failed to import backup' });
  }
};

// Helper used by scheduled jobs: create a full-platform backup snapshot and store in DB.
export async function createWeeklyPlatformBackupSnapshot() {
  try {
    const backup = await buildBackup('all');
    const expiresAt = new Date();
    // 6 months ≈ 180 days
    expiresAt.setDate(expiresAt.getDate() + 180);
    await BackupSnapshot.create({
      scope: 'all',
      restaurantId: null,
      expiresAt,
      payload: backup,
    });
    logger.info('Weekly platform backup snapshot created', {
      restaurantCount: backup.meta.restaurantCount,
    });
  } catch (err: any) {
    logger.error('Failed to create weekly platform backup snapshot', { error: err?.message });
  }
}


