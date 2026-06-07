'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Calendar, Users, Star, BarChart3,
  ReceiptIndianRupee, TrendingUp, Image, Wallet, Power, Store, ExternalLink, Copy, Check,
} from 'lucide-react';
import api from '@/services/api';
import { useRestaurantPage } from '@/context/RestaurantPageContext';

export type StaffPermissionKey =
  | 'dashboard'
  | 'orders'
  | 'menu'
  | 'bookings'
  | 'heroImages'
  | 'billing'
  | 'payments'
  | 'revenue'
  | 'customers'
  | 'reviews'
  | 'analytics';

interface StaffNavItem {
  key: StaffPermissionKey;
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

const STAFF_NAV_ITEMS: StaffNavItem[] = [
  { key: 'dashboard', name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
  { key: 'orders', name: 'Orders', href: '/staff/orders', icon: ShoppingBag },
  { key: 'menu', name: 'Menu', href: '/staff/menu', icon: UtensilsCrossed },
  { key: 'bookings', name: 'Bookings', href: '/staff/bookings', icon: Calendar },
  { key: 'heroImages', name: 'Hero Images', href: '/staff/hero-images', icon: Image },
  { key: 'billing', name: 'Billing Panel', href: '/staff/billing', icon: ReceiptIndianRupee },
  { key: 'payments', name: 'Payments', href: '/staff/payments', icon: Wallet },
  { key: 'revenue', name: 'Revenue', href: '/staff/revenue', icon: TrendingUp },
  { key: 'customers', name: 'Customers', href: '/staff/customers', icon: Users },
  { key: 'reviews', name: 'Reviews', href: '/staff/reviews', icon: Star },
  { key: 'analytics', name: 'Analytics', href: '/staff/analytics', icon: BarChart3 },
];

interface StaffUser {
  name?: string;
  email?: string;
  role?: string;
  restaurantSlug?: string;
}

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setRestaurant } = useRestaurantPage();
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [permissions, setPermissions] = useState<StaffPermissionKey[]>([]);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('admin');
    if (!token || !stored) {
      router.replace('/admin/login');
      return;
    }
    try {
      const user = JSON.parse(stored);
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
        return;
      }
      if (!['staff', 'manager', 'cashier'].includes(user.role)) {
        router.replace('/admin/login');
        return;
      }
      setStaffUser(user);
    } catch {
      router.replace('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    if (!staffUser) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    api
      .get<{ rolePermissions?: Record<string, string[]>; slug?: string; name?: string; logo?: string; primaryColor?: string }>('/restaurants/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((data: any) => {
        const rolePerms = data?.rolePermissions || {};
        const role = staffUser.role || 'staff';
        const perms = rolePerms[role];
        setPermissions(Array.isArray(perms) ? perms : ['dashboard', 'orders']);
        if (data?.slug) setStoreSlug(data.slug);
        if (data?.slug && data?.name) setRestaurant({ slug: data.slug, name: data.name, logo: data.logo, primaryColor: data.primaryColor });
      })
      .catch(() => setPermissions(['dashboard', 'orders']));
    return () => setRestaurant(null);
  }, [staffUser]);

  useEffect(() => {
    if (!staffUser) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    api
      .get<any[]>('/orders', {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'pending' },
      })
      .then((orders) => {
        const list = Array.isArray(orders) ? orders : [];
        setPendingOrdersCount(list.filter((o: any) => o.status === 'pending' || o.status === 'confirmed').length);
      })
      .catch(() => {});
  }, [staffUser]);

  if (!staffUser) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#080808' }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
            style={{ border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }}
          />
          <p style={{ color: '#a89070' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const allowedNav = STAFF_NAV_ITEMS.filter((item) => permissions.includes(item.key));
  const initials = (staffUser.name || 'S').slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ background: '#080808' }}>
      {/* Sidebar */}
      <div
        className="w-64 min-h-screen flex flex-col flex-shrink-0"
        style={{ background: '#0d0d0d' }}
      >
        {/* Logo / Brand */}
        <div
          className="p-6"
          style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)' }}
            >
              <span className="text-xl">👨‍🍳</span>
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#f8f4ed' }}>Staff Panel</div>
              <div
                className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5"
                style={{ background: 'rgba(200,151,42,0.15)', color: '#f0c060' }}
              >
                Staff
              </div>
            </div>
          </div>
        </div>

        {/* Store slug */}
        {storeSlug && (
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: '#a89070' }}>Your store</p>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 min-w-0 text-xs px-2 py-1.5 rounded truncate"
                style={{ color: '#c8972a', background: '#1c1c1c' }}
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
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  (e.currentTarget as HTMLElement).style.color = '#f8f4ed';
                  (e.currentTarget as HTMLElement).style.background = '#1c1c1c';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
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
                style={{ color: '#a89070', background: 'transparent' }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLElement).style.color = '#f8f4ed';
                  (e.currentTarget as HTMLElement).style.background = '#1c1c1c';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLElement).style.color = '#a89070';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
                title="Copy link"
              >
                {linkCopied ? <Check className="w-4 h-4" style={{ color: '#22c55e' }} /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {allowedNav.map((item) => {
            const href = item.key === 'dashboard' ? '/staff' : item.href;
            const isActive = pathname === href || (href !== '/staff' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.key}
                href={href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors"
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                        color: '#080808',
                        fontWeight: 700,
                      }
                    : { color: '#a89070' }
                }
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.08)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-sm">{item.name}</span>
                {item.key === 'orders' && pendingOrdersCount > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 700 }}
                  >
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div
          className="p-4"
          style={{ borderTop: '1px solid rgba(200,151,42,0.15)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a)' }}
            >
              <span className="text-sm font-bold" style={{ color: '#080808' }}>{initials}</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: '#f8f4ed' }}>{staffUser.name || 'Staff'}</div>
              <div className="text-xs truncate" style={{ color: '#a89070' }}>{staffUser.email || ''}</div>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('admin');
              window.location.href = '/admin/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm"
            style={{ color: '#a89070', background: 'transparent' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              (e.currentTarget as HTMLElement).style.color = '#f8f4ed';
              (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.08)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              (e.currentTarget as HTMLElement).style.color = '#a89070';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <Power className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="px-6 py-4 flex-shrink-0"
          style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(200,151,42,0.15)' }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold" style={{ color: '#f8f4ed' }}>Staff Panel</h1>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto" style={{ background: '#080808' }}>{children}</main>
      </div>
    </div>
  );
}
