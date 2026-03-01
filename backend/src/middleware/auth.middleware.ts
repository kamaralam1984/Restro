import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserRole } from '../models/User.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        restaurantId?: string;
      };
    }
  }
}

/** Verify JWT and attach user info to req.user */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization header or invalid format' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as {
      userId: string;
      email: string;
      role: UserRole;
      restaurantId?: string;
    };
    req.user = decoded;
    next();
  } catch (error: any) {
    return res.status(403).json({ error: error.message || 'Invalid or expired token' });
  }
};

/** Only super_admin can access */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

/** Platform panel: super_admin OR master_admin (shared API, separate login URLs) */
export const requirePlatformAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !['super_admin', 'master_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Platform admin access required' });
  }
  next();
};

/** Restaurant admin (role === 'admin') only */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/** Rental admin (restaurant-level) or platform admins */
export const requireAdminOrSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !['admin', 'manager', 'super_admin', 'master_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/** Any restaurant staff (admin, manager, staff, cashier) or platform admins – then use requirePermission for resource-level access */
export const requireStaffOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !['admin', 'manager', 'staff', 'cashier', 'super_admin', 'master_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Staff or admin access required' });
  }
  next();
};

/** Any staff-level user (admin, manager, staff, cashier) of the restaurant */
export const requireStaff = (req: Request, res: Response, next: NextFunction) => {
  const staffRoles: UserRole[] = ['admin', 'manager', 'staff', 'cashier'];
  if (!req.user || !staffRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }
  next();
};

/**
 * Ensure the authenticated user belongs to the currently resolved tenant.
 * super_admin bypasses this check.
 */
export const requireTenantAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  // super_admin and master_admin can access any tenant (platform level)
  if (['super_admin', 'master_admin'].includes(req.user.role)) return next();

  const tenantId = req.restaurantId;
  if (!tenantId) {
    return res.status(400).json({ error: 'Restaurant context required' });
  }
  if (req.user.restaurantId !== tenantId) {
    return res.status(403).json({ error: 'Access denied for this restaurant' });
  }
  next();
};

/** Role-based authorization helper */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
