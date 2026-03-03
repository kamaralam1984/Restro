'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, UtensilsCrossed, Calendar, ReceiptIndianRupee, Users, BarChart3 } from 'lucide-react';
import api from '@/services/api';

const STAFF_QUICK_LINKS: { key: string; label: string; href: string; icon: any }[] = [
  { key: 'orders', label: 'Orders', href: '/staff/orders', icon: ShoppingBag },
  { key: 'menu', label: 'Menu', href: '/staff/menu', icon: UtensilsCrossed },
  { key: 'bookings', label: 'Bookings', href: '/staff/bookings', icon: Calendar },
  { key: 'billing', label: 'Billing Panel', href: '/staff/billing', icon: ReceiptIndianRupee },
  { key: 'customers', label: 'Customers', href: '/staff/customers', icon: Users },
  { key: 'analytics', label: 'Analytics', href: '/staff/analytics', icon: BarChart3 },
];

export default function StaffDashboardPage() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userName, setUserName] = useState('');
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      try {
        const admin = JSON.parse(stored);
        setUserName(admin.name || 'Staff');
      } catch {}
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    api
      .get<{ rolePermissions?: Record<string, string[]> }>('/restaurants/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((data: any) => {
        const rolePerms = data?.rolePermissions || {};
        const stored2 = localStorage.getItem('admin');
        let role = 'staff';
        if (stored2) try { role = JSON.parse(stored2).role || 'staff'; } catch {}
        setPermissions(Array.isArray(rolePerms[role]) ? rolePerms[role] : ['dashboard', 'orders']);
      })
      .catch(() => setPermissions(['dashboard', 'orders']));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api
      .get<any[]>('/orders', { headers: { Authorization: `Bearer ${token}` }, params: { status: 'pending' } })
      .then((orders) => {
        const list = Array.isArray(orders) ? orders : [];
        setPendingCount(list.filter((o: any) => o.status === 'pending' || o.status === 'confirmed').length);
      })
      .catch(() => setPendingCount(0));
  }, []);

  const allowedLinks = STAFF_QUICK_LINKS.filter((item) => permissions.includes(item.key));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Welcome, {userName}
        </h1>
        <p className="text-slate-400 text-sm mt-1">Staff panel — use the sidebar to access allowed sections</p>
      </div>

      {pendingCount !== null && permissions.includes('orders') && (
        <div className="bg-orange-600/20 border border-orange-600/40 rounded-xl p-4 flex items-center justify-between">
          <span className="text-orange-200 font-medium">{pendingCount} pending order(s)</span>
          <Link
            href="/staff/orders"
            className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700"
          >
            View Orders
          </Link>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick access</h2>
        <div className="flex flex-wrap gap-3">
          {allowedLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-orange-600/20 text-slate-300 hover:text-orange-300 rounded-lg text-sm font-medium transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
