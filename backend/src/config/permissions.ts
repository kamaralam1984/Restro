import type { UserRole } from '../models/User.model';

/**
 * Permission keys used by requirePermission middleware.
 * manager: orders + booking
 * staff: only update order status
 * cashier: billing only
 */
export type Permission =
  | 'menu:manage'
  | 'orders:read'
  | 'orders:update'       // e.g. update status
  | 'orders:manage'       // full CRUD / cancel
  | 'booking:manage'
  | 'billing:manage'
  | 'analytics:view'
  | 'users:manage'
  | 'tables:manage'
  | 'revenue:view';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: ['menu:manage', 'orders:read', 'orders:update', 'orders:manage', 'booking:manage', 'billing:manage', 'analytics:view', 'users:manage', 'tables:manage', 'revenue:view'],
  master_admin: ['menu:manage', 'orders:read', 'orders:update', 'orders:manage', 'booking:manage', 'billing:manage', 'analytics:view', 'users:manage', 'tables:manage', 'revenue:view'],
  admin: ['menu:manage', 'orders:read', 'orders:update', 'orders:manage', 'booking:manage', 'billing:manage', 'analytics:view', 'users:manage', 'tables:manage', 'revenue:view'],
  manager: ['menu:manage', 'orders:read', 'orders:update', 'orders:manage', 'booking:manage', 'billing:manage', 'analytics:view', 'tables:manage', 'revenue:view'],
  staff: ['orders:read', 'orders:update'],
  cashier: ['billing:manage', 'orders:read'],
  customer: [],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}
