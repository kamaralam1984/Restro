import { Request, Response, NextFunction } from 'express';
import { hasPermission, Permission } from '../config/permissions';
import type { UserRole } from '../models/User.model';

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const role = (user.role as UserRole) || 'customer';
    if (hasPermission(role, permission)) {
      return next();
    }
    return res.status(403).json({ error: 'You do not have permission to perform this action' });
  };
}
