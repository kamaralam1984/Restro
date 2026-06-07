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
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#f8f4ed' }}>
          Welcome, {userName}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#a89070' }}>Staff panel — use the sidebar to access allowed sections</p>
      </div>

      {pendingCount !== null && permissions.includes('orders') && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ background: 'rgba(200,151,42,0.10)', border: '1px solid rgba(200,151,42,0.35)' }}
        >
          <span className="font-medium" style={{ color: '#f0c060' }}>{pendingCount} pending order(s)</span>
          <Link
            href="/staff/orders"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
              color: '#080808',
              fontWeight: 700,
            }}
          >
            View Orders
          </Link>
        </div>
      )}

      <div
        className="rounded-xl p-5"
        style={{
          background: '#141414',
          border: '1px solid rgba(200,151,42,0.13)',
          borderRadius: '16px',
        }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: '#a89070' }}
        >
          Quick access
        </h2>
        <div className="flex flex-wrap gap-3">
          {allowedLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: '#1c1c1c', color: '#a89070' }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.08)';
                (e.currentTarget as HTMLElement).style.color = '#f0c060';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                (e.currentTarget as HTMLElement).style.background = '#1c1c1c';
                (e.currentTarget as HTMLElement).style.color = '#a89070';
              }}
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
