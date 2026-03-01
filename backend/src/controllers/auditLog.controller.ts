import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuditLog } from '../models/AuditLog.model';

/** Super admin / platform: list audit logs with filters */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { restaurantId, userId, action, entityType, page = 1, limit = 50 } = req.query;
    const filter: Record<string, unknown> = {};
    if (restaurantId && mongoose.Types.ObjectId.isValid(String(restaurantId))) filter.restaurantId = new mongoose.Types.ObjectId(String(restaurantId));
    if (userId && mongoose.Types.ObjectId.isValid(String(userId))) filter.userId = new mongoose.Types.ObjectId(String(userId));
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
