'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Calendar, Users, UserCog,
  Star, BarChart3, Settings, Power, ReceiptIndianRupee, TrendingUp, Image,
  Store, Package, CreditCard, Building2, PieChart, Wallet, ExternalLink, Copy, Check,
} from 'lucide-react';
import api from '@/services/api';
import type { AdminUser } from './AdminLayout';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  /** If set, nav item is shown only when this restaurant feature is enabled (rental admin only) */
  featureKey?: keyof RestaurantFeatures;
}

interface RestaurantFeatures {
  menuManagement?: boolean;
  onlineOrdering?: boolean;
  tableBooking?: boolean;
  billing?: boolean;
  onlinePayments?: boolean;
  heroImages?: boolean;
  analytics?: boolean;
  staffControl?: boolean;
  reviews?: boolean;
}

const SUPER_ADMIN_NAV: NavItem[] = [
  { name: 'Restaurants',    href: '/admin/super/restaurants',    icon: Store },
  { name: 'Users',          href: '/admin/super/users',           icon: Users },
  { name: 'Analytics',      href: '/admin/super/analytics',      icon: PieChart },
  { name: 'Plans',          href: '/admin/super/plans',          icon: Package },
  { name: 'Subscriptions',  href: '/admin/super/subscriptions',  icon: CreditCard },
];

const MASTER_ADMIN_NAV: NavItem[] = [
  { name: 'Restaurants',    href: '/admin/master/restaurants',   icon: Store },
  { name: 'Users',          href: '/admin/master/users',         icon: Users },
  { name: 'Analytics',      href: '/admin/master/analytics',     icon: PieChart },
  { name: 'Plans',          href: '/admin/master/plans',        icon: Package },
  { name: 'Subscriptions',  href: '/admin/master/subscriptions', icon: CreditCard },
];

const ADMIN_NAV: NavItem[] = [
  { name: 'Dashboard',    href: '/admin/dashboard',    icon: LayoutDashboard },
  { name: 'Orders',       href: '/admin/orders',       icon: ShoppingBag,       featureKey: 'onlineOrdering' },
  { name: 'Menu',         href: '/admin/menu',         icon: UtensilsCrossed,   featureKey: 'menuManagement' },
  { name: 'Bookings',     href: '/admin/bookings',     icon: Calendar,          featureKey: 'tableBooking' },
  { name: 'Hero Images',  href: '/admin/hero-images',  icon: Image,             featureKey: 'heroImages' },
  { name: 'Billing',      href: '/admin/billing',      icon: ReceiptIndianRupee, featureKey: 'billing' },
  { name: 'Payments',     href: '/admin/payments',     icon: Wallet,            featureKey: 'onlinePayments' },
  { name: 'Revenue',      href: '/admin/revenue',      icon: TrendingUp,        featureKey: 'billing' },
  { name: 'Customers',    href: '/admin/customers',    icon: Users,             featureKey: 'onlineOrdering' },
  { name: 'Staff & Users', href: '/admin/users',       icon: UserCog,           featureKey: 'staffControl' },
  { name: 'Reviews',      href: '/admin/reviews',      icon: Star,              featureKey: 'reviews' },
  { name: 'Analytics',    href: '/admin/analytics',    icon: BarChart3,         featureKey: 'analytics' },
  { name: 'Settings',     href: '/admin/settings',     icon: Settings },
];

export type PanelType = 'super' | 'master' | 'rental';

interface SidebarProps {
  adminUser?: AdminUser | null;
  /** When set, overrides role-based nav (for separate panel URLs) */
  panelType?: PanelType;
}

export default function Sidebar({ adminUser: adminUserProp, panelType: panelTypeProp }: SidebarProps) {
  const pathname = usePathname();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [localAdmin, setLocalAdmin] = useState<AdminUser | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [features, setFeatures] = useState<RestaurantFeatures | null>(null);

  const adminUser = adminUserProp ?? localAdmin ?? {};
  const panelType: PanelType = panelTypeProp ?? (adminUser.role === 'super_admin' ? 'super' : adminUser.role === 'master_admin' ? 'master' : 'rental');

  useEffect(() => {
    if (adminUserProp) return;
    const stored = localStorage.getItem('admin');
    if (stored) {
      try { setLocalAdmin(JSON.parse(stored)); } catch {}
    }
  }, [adminUserProp]);

  useEffect(() => {
    if (panelType !== 'rental') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get<{ slug?: string; features?: RestaurantFeatures }>('/restaurants/me')
      .then((data: any) => {
        if (data?.slug) setStoreSlug(data.slug);
        if (data?.features && typeof data.features === 'object') setFeatures(data.features);
      })
      .catch(() => {});
    const slug = (adminUser as any).restaurantSlug;
    if (slug) setStoreSlug(slug);
  }, [panelType, adminUser]);

  useEffect(() => {
    if (adminUser.role !== 'super_admin' && adminUser.role !== 'master_admin') loadPendingOrders();
  }, [adminUser.role]);

  const loadPendingOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const orders = await api.get<any[]>('/orders', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'pending' },
      });
      const pending = Array.isArray(orders)
        ? orders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed').length
        : 0;
      setPendingOrdersCount(pending);
    } catch {}
  };

  const isPlatform = panelType === 'super' || panelType === 'master';
  const rentalNavItems = (() => {
    const withBadge = ADMIN_NAV.map((item) =>
      item.name === 'Orders' ? { ...item, badge: pendingOrdersCount } : item
    );
    if (!features) return withBadge;
    return withBadge.filter((item) => {
      if (!item.featureKey) return true;
      return item.featureKey in features && features[item.featureKey] === true;
    });
  })();
  const navItems = panelType === 'super'
    ? SUPER_ADMIN_NAV
    : panelType === 'master'
      ? MASTER_ADMIN_NAV
      : rentalNavItems;

  const initials = (adminUser.name || 'A').slice(0, 1).toUpperCase();
  const roleLabel = panelType === 'super' ? 'Super Admin' : panelType === 'master' ? 'Master Admin' : 'Rental Admin';
  const roleBg = panelType === 'super' ? 'bg-purple-600' : panelType === 'master' ? 'bg-amber-600' : 'bg-orange-600';
  const logoutHref = panelType === 'super' ? '/admin/super/login' : panelType === 'master' ? '/admin/master/login' : '/admin/login';

  return (
    <div className="w-64 bg-slate-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${roleBg} rounded-lg flex items-center justify-center`}>
            {isPlatform
              ? <Building2 className="w-6 h-6 text-white" />
              : <span className="text-xl">👨‍🍳</span>}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">
              {isPlatform ? 'Restro OS' : 'My Restaurant'}
            </div>
            <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 ${
              panelType === 'super' ? 'bg-purple-600/30 text-purple-300' : panelType === 'master' ? 'bg-amber-600/30 text-amber-300' : 'bg-orange-600/30 text-orange-300'
            }`}>
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Your store link (rental admin only) */}
      {panelType === 'rental' && storeSlug && (
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-xs font-medium text-slate-400 mb-2">Your store</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 text-xs text-orange-400 bg-slate-800 px-2 py-1.5 rounded truncate" title={`/r/${storeSlug}`}>
              /r/{storeSlug}
            </code>
            <a
              href={`/r/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
              title="Open store"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => {
                const url = typeof window !== 'undefined' ? `${window.location.origin}/r/${storeSlug}` : '';
                navigator.clipboard?.writeText(url).then(() => {
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                });
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
              title="Copy link"
            >
              {linkCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? panelType === 'super'
                    ? 'bg-purple-600 text-white'
                    : panelType === 'master'
                      ? 'bg-amber-600 text-white'
                      : 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-sm">{item.name}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 ${roleBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">
              {adminUser.name || 'Admin'}
            </div>
            <div className="text-slate-400 text-xs truncate">
              {adminUser.email || ''}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            window.location.href = logoutHref;
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
        >
          <Power className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
