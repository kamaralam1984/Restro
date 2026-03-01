import { AuditLog } from '../models/AuditLog.model';
import mongoose from 'mongoose';

interface AuditParams {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userRole: string;
  restaurantId?: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function createAuditLog(params: AuditParams): Promise<void> {
  try {
    await AuditLog.create({
      userId: params.userId,
      userEmail: params.userEmail,
      userRole: params.userRole,
      restaurantId: params.restaurantId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      ip: params.ip,
      userAgent: params.userAgent,
    });
  } catch (err) {
    console.error('Audit log write failed:', err);
  }
}
