'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Calendar, Users, UserCog,
  Star, BarChart3, Settings, Power, ReceiptIndianRupee, TrendingUp, Image,
  ShieldCheck, IndianRupee, FileText,
  Store, Package, CreditCard, Building2, PieChart, Wallet, ExternalLink, Copy, Check,
  Database, Bug, Tag, ChefHat, QrCode, Ticket, Gift,
  Monitor, Package2, Megaphone, UserCheck, Users2, BadgeIndianRupee,
  ShoppingCart, Handshake, Brain, GitBranch, Palette, Layers, Sparkles,
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
  { name: 'Visitors',       href: '/admin/super/visitors',       icon: BarChart3 },
  { name: 'Plans',          href: '/admin/super/plans',          icon: Package },
  { name: 'Subscriptions',  href: '/admin/super/subscriptions',  icon: CreditCard },
  { name: 'Backup & Restore', href: '/admin/super/backup',       icon: Database },
  { name: 'Errors & Bugs',  href: '/admin/super/errors',         icon: Bug },
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
  { name: 'Kitchen Display', href: '/admin/kds',       icon: ChefHat,           featureKey: 'onlineOrdering' },
  { name: 'POS Billing',  href: '/admin/pos',          icon: Monitor },
  { name: 'Menu',         href: '/admin/menu',         icon: UtensilsCrossed,   featureKey: 'menuManagement' },
  { name: 'Bookings',     href: '/admin/bookings',     icon: Calendar },
  { name: 'Tables',       href: '/admin/tables',       icon: LayoutDashboard,    featureKey: 'tableBooking' },
  { name: 'QR Menu',      href: '/admin/qr-menu',      icon: QrCode },
  { name: 'Inventory',    href: '/admin/inventory',    icon: Package2 },
  { name: 'Table rates & offers', href: '/admin/table-rates', icon: IndianRupee },
  { name: 'Offers & Discounts',   href: '/admin/offers',       icon: Tag },
  { name: 'Coupons',      href: '/admin/coupons',      icon: Ticket },
  { name: 'Loyalty Program', href: '/admin/loyalty',   icon: Gift },
  { name: 'Marketing',    href: '/admin/marketing',    icon: Megaphone },
  { name: 'CRM',          href: '/admin/crm',          icon: UserCheck },
  { name: 'Hero Images',  href: '/admin/hero-images',  icon: Image,             featureKey: 'heroImages' },
  { name: 'Billing Panel', href: '/admin/billing',      icon: ReceiptIndianRupee, featureKey: 'billing' },
  { name: 'Payments',     href: '/admin/payments',     icon: Wallet,            featureKey: 'onlinePayments' },
  { name: 'Revenue',      href: '/admin/revenue',      icon: TrendingUp,        featureKey: 'billing' },
  { name: 'Reports',      href: '/admin/reports',      icon: FileText,          featureKey: 'billing' },
  { name: 'Customers',    href: '/admin/customers',    icon: Users,             featureKey: 'onlineOrdering' },
  { name: 'Employees',    href: '/admin/employees',    icon: Users2 },
  { name: 'Wallet',       href: '/admin/wallet',       icon: BadgeIndianRupee },
  { name: 'Abandoned Cart', href: '/admin/abandoned-cart', icon: ShoppingCart },
  { name: 'Affiliates',   href: '/admin/affiliates',   icon: Handshake },
  { name: 'Staff & Users', href: '/admin/users',       icon: UserCog,           featureKey: 'staffControl' },
  { name: 'Staff roles',   href: '/admin/staff-roles', icon: ShieldCheck,       featureKey: 'staffControl' },
  { name: 'Reviews',      href: '/admin/reviews',      icon: Star,              featureKey: 'reviews' },
  { name: 'Analytics',    href: '/admin/analytics',    icon: BarChart3,         featureKey: 'analytics' },
  { name: 'AI Insights',  href: '/admin/ai-insights',  icon: Brain },
  { name: 'Multi-Branch', href: '/admin/branches',     icon: GitBranch },
  { name: 'Franchise',    href: '/admin/franchise',    icon: Building2 },
  { name: 'White Label',  href: '/admin/white-label',  icon: Palette },
  { name: 'Theme Builder', href: '/admin/website-builder', icon: Layers },
  { name: 'Theme Market', href: '/admin/themes',       icon: Sparkles },
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
  const logoutHref = panelType === 'super' ? '/admin/super/login' : panelType === 'master' ? '/admin/master/login' : '/admin/login';

  // Role badge colours — kept subtle with gold tones, differentiated by hue only
  const roleBadgeStyle: React.CSSProperties =
    panelType === 'super'
      ? { background: 'rgba(168,120,200,0.15)', color: '#d4a0f0' }
      : panelType === 'master'
        ? { background: 'rgba(200,151,42,0.18)', color: '#f0c060' }
        : { background: 'rgba(200,151,42,0.12)', color: '#c8972a' };

  // Avatar/icon background per panel type
  const roleIconStyle: React.CSSProperties =
    panelType === 'super'
      ? { background: 'linear-gradient(135deg,#5b2d8a,#9b4dca)' }
      : panelType === 'master'
        ? { background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)' }
        : { background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)' };

  return (
    <div
      className="w-64 min-h-screen flex flex-col"
      style={{ background: '#0d0d0d' }}
    >
      {/* Logo */}
      <div
        className="p-6"
        style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={roleIconStyle}
          >
            {isPlatform
              ? <Building2 className="w-6 h-6" style={{ color: '#080808' }} />
              : <span className="text-xl">👨‍🍳</span>}
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#f8f4ed' }}>
              {isPlatform ? 'Restro OS' : 'My Restaurant'}
            </div>
            <div
              className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5"
              style={roleBadgeStyle}
            >
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Your store link (rental admin only) */}
      {panelType === 'rental' && storeSlug && (
        <div
          className="px-4 py-3"
          style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: '#a89070' }}>Your store</p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 min-w-0 text-xs px-2 py-1.5 rounded truncate"
              style={{ color: '#c8972a', background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)' }}
              title={`/r/${storeSlug}`}
            >
              /r/{storeSlug}
            </code>
            <a
              href={`/r/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded transition-colors"
              style={{ color: '#a89070' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#f8f4ed';
                (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#a89070';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
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
              className="p-1.5 rounded transition-colors"
              style={{ color: '#a89070', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#f8f4ed';
                (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#a89070';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              title="Copy link"
            >
              {linkCopied
                ? <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
                : <Copy className="w-4 h-4" />}
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
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                    }
                  : {
                      color: '#a89070',
                    }
              }
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#f8f4ed';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#a89070';
                }
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-sm">{item.name}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div
        className="p-4"
        style={{ borderTop: '1px solid rgba(200,151,42,0.15)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={roleIconStyle}
          >
            <span className="text-sm font-bold" style={{ color: '#080808' }}>{initials}</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: '#f8f4ed' }}>
              {adminUser.name || 'Admin'}
            </div>
            <div className="text-xs truncate" style={{ color: '#a89070' }}>
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
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm"
          style={{ color: '#a89070', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#f8f4ed';
            (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#a89070';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <Power className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
