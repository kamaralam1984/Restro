'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Calendar, Users, UserCog,
  Star, BarChart3, Settings, Power, ReceiptIndianRupee, TrendingUp, Image,
  Store, Package, CreditCard, Building2, PieChart,
} from 'lucide-react';
import api from '@/services/api';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

interface AdminUser {
  name?: string;
  email?: string;
  role?: string;
  restaurantId?: string;
}

const SUPER_ADMIN_NAV: NavItem[] = [
  { name: 'Dashboard',      href: '/admin/dashboard',            icon: LayoutDashboard },
  { name: 'Restaurants',    href: '/admin/super/restaurants',    icon: Store },
  { name: 'Analytics',      href: '/admin/super/analytics',      icon: PieChart },
  { name: 'Plans',          href: '/admin/super/plans',          icon: Package },
  { name: 'Subscriptions',  href: '/admin/super/subscriptions',  icon: CreditCard },
];

const ADMIN_NAV: NavItem[] = [
  { name: 'Dashboard',    href: '/admin/dashboard',    icon: LayoutDashboard },
  { name: 'Orders',       href: '/admin/orders',       icon: ShoppingBag },
  { name: 'Menu',         href: '/admin/menu',         icon: UtensilsCrossed },
  { name: 'Bookings',     href: '/admin/bookings',     icon: Calendar },
  { name: 'Hero Images',  href: '/admin/hero-images',  icon: Image },
  { name: 'Billing',      href: '/admin/billing',      icon: ReceiptIndianRupee },
  { name: 'Revenue',      href: '/admin/revenue',      icon: TrendingUp },
  { name: 'Customers',    href: '/admin/customers',    icon: Users },
  { name: 'Users',        href: '/admin/users',        icon: UserCog },
  { name: 'Reviews',      href: '/admin/reviews',      icon: Star },
  { name: 'Analytics',    href: '/admin/analytics',    icon: BarChart3 },
  { name: 'Settings',     href: '/admin/settings',     icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [adminUser, setAdminUser] = useState<AdminUser>({});

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      try { setAdminUser(JSON.parse(stored)); } catch {}
    }
    if (adminUser.role !== 'super_admin') loadPendingOrders();
  }, []);

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

  const isSuperAdmin = adminUser.role === 'super_admin';
  const navItems = isSuperAdmin
    ? SUPER_ADMIN_NAV
    : ADMIN_NAV.map((item) =>
        item.name === 'Orders' ? { ...item, badge: pendingOrdersCount } : item
      );

  const initials = (adminUser.name || 'A').slice(0, 1).toUpperCase();
  const roleLabel = isSuperAdmin ? 'Super Admin' : 'Restaurant Admin';
  const roleBg = isSuperAdmin ? 'bg-purple-600' : 'bg-orange-600';

  return (
    <div className="w-64 bg-slate-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${roleBg} rounded-lg flex items-center justify-center`}>
            {isSuperAdmin
              ? <Building2 className="w-6 h-6 text-white" />
              : <span className="text-xl">👨‍🍳</span>}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">
              {isSuperAdmin ? 'Restro OS' : 'Restaurant'}
            </div>
            <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 ${
              isSuperAdmin ? 'bg-purple-600/30 text-purple-300' : 'bg-orange-600/30 text-orange-300'
            }`}>
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

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
                  ? isSuperAdmin
                    ? 'bg-purple-600 text-white'
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
            window.location.href = '/admin/login';
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
