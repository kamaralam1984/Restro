'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Store, Bell, ChevronRight } from 'lucide-react';
import api from '@/services/api';

interface AdminStored {
  role?: string;
  restaurantName?: string;
  restaurantSlug?: string;
  name?: string;
}

/** Shown on main page (/) when restaurant owner is logged in — offers/notifications and quick link to dashboard. */
export default function OwnerStrip() {
  const [admin, setAdmin] = useState<AdminStored | null>(null);
  const [notifications, setNotifications] = useState<{ message: string; type?: string }[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('admin');
      const token = localStorage.getItem('token');
      if (!raw || !token) {
        setAdmin(null);
        return;
      }
      const parsed = JSON.parse(raw) as AdminStored;
      // Only show for restaurant-level roles (not super_admin / master_admin)
      const isRestaurantOwner = parsed.role && !['super_admin', 'master_admin'].includes(parsed.role);
      if (!isRestaurantOwner) {
        setAdmin(null);
        return;
      }
      setAdmin(parsed);
    } catch {
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    if (!admin) return;
    const load = async () => {
      try {
        const list: { message: string; type?: string }[] = [];
        try {
          const data = await api.get<unknown[]>('/orders', { params: { status: 'pending', limit: 50 } });
          const pendingCount = Array.isArray(data) ? data.length : 0;
          if (pendingCount > 0) {
            list.push({ message: `You have ${pendingCount} pending order(s)`, type: 'orders' });
          }
        } catch {
          // ignore
        }
        list.push({ message: 'Manage your menu, orders & bookings from the dashboard.', type: 'info' });
        setNotifications(list.length > 0 ? list : [{ message: 'Welcome back! Go to dashboard to manage your restaurant.', type: 'info' }]);
      } catch {
        setNotifications([{ message: 'Welcome back! Go to dashboard to manage your restaurant.', type: 'info' }]);
      }
    };
    load();
  }, [admin]);

  if (!admin) return null;

  const storeUrl = admin.restaurantSlug ? `/r/${admin.restaurantSlug}` : null;

  return (
    <motion.section
      className="bg-slate-900/95 border-b border-slate-800 backdrop-blur-sm"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                Welcome back{admin.name ? `, ${admin.name}` : ''}
                {admin.restaurantName ? ` · ${admin.restaurantName}` : ''}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">Offers & notifications for your restaurant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm">
                <Bell className="w-4 h-4 text-orange-400" />
                <span>{notifications[0].message}</span>
              </div>
            )}
            {storeUrl && (
              <Link
                href={storeUrl}
                className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
              >
                Your store
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Dashboard
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        {notifications.length > 1 && (
          <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-2">
            {notifications.slice(1, 4).map((n, i) => (
              <span key={i} className="text-xs text-slate-500 bg-slate-800/60 px-2 py-1 rounded">
                {n.message}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
