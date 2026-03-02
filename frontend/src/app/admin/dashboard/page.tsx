'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, IndianRupee, Clock, CreditCard, Store, Users, TrendingUp, AlertCircle, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/services/api';

// ── Super Admin Dashboard ─────────────────────────────────────────────────────

interface PlatformStats {
  activeSubscriptions: number;
  expiredSubscriptions: number;
  restaurantsOnTrial: number;
  totalRevenue: number;
}

interface Restaurant {
  _id: string;
  name: string;
  city: string;
  status: string;
  subscriptionStatus: string;
  trialEndsAt?: string;
  createdAt: string;
}

function SuperAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [statsData, restData] = await Promise.all([
        api.get('/super-admin/subscriptions/stats', { headers }),
        api.get('/super-admin/restaurants?limit=8', { headers }),
      ]);
      setStats(statsData);
      setRestaurants(restData.restaurants || []);
    } catch (err) {
      console.error('Failed to load super admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { title: 'Active Subscriptions', value: stats.activeSubscriptions, icon: CreditCard, color: 'bg-green-600' },
    { title: 'On Trial', value: stats.restaurantsOnTrial, icon: Store, color: 'bg-blue-600' },
    { title: 'Expired', value: stats.expiredSubscriptions, icon: AlertCircle, color: 'bg-red-600' },
    { title: 'Total Revenue', value: `₹${(stats.totalRevenue / 100).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-purple-600' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-slate-400">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all restaurants and subscriptions</p>
        </div>
        <Link
          href="/admin/super/restaurants"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Store className="w-4 h-4" />
          Manage Restaurants
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            className={`${card.color} rounded-xl p-5 text-white`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80 mb-1">{card.title}</p>
                <h2 className="text-3xl font-bold">{card.value}</h2>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <card.icon className="w-7 h-7" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Restaurant Control', href: '/admin/super/restaurants', icon: Store, desc: 'Manage & control all restaurants + features' },
          { label: 'Manage Plans', href: '/admin/super/plans', icon: TrendingUp, desc: 'Create and edit subscription plans' },
          { label: 'All Subscriptions', href: '/admin/super/subscriptions', icon: CreditCard, desc: 'View and manage all subscriptions' },
          { label: 'All Users', href: '/admin/super/restaurants', icon: Users, desc: 'Platform-wide user overview' },
        ].map((action, i) => (
          <Link key={i} href={action.href}>
            <motion.div
              className="bg-slate-900 border border-slate-800 hover:border-purple-600/50 rounded-xl p-5 cursor-pointer transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <action.icon className="w-5 h-5 text-purple-400 group-hover:text-white" />
                </div>
                <span className="text-white font-semibold text-sm">{action.label}</span>
              </div>
              <p className="text-slate-400 text-xs">{action.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Restaurants */}
      <div className="bg-slate-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Restaurants</h2>
          <Link href="/admin/super/restaurants" className="text-purple-400 hover:text-purple-300 text-sm">
            View all →
          </Link>
        </div>
        {restaurants.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No restaurants yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-3 px-2">Restaurant</th>
                  <th className="text-left py-3 px-2">City</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Subscription</th>
                  <th className="text-left py-3 px-2">Joined</th>
                  <th className="text-left py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r._id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-2 text-white font-medium">{r.name}</td>
                    <td className="py-3 px-2 text-slate-300">{r.city}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        r.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                      }`}>{r.status}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        r.subscriptionStatus === 'active' ? 'bg-blue-600/20 text-blue-400' :
                        r.subscriptionStatus === 'trial' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>{r.subscriptionStatus}</span>
                    </td>
                    <td className="py-3 px-2 text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-2">
                      <Link href={`/admin/super/restaurants/${r._id}`}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white rounded-lg text-xs font-semibold transition-colors">
                        <Settings2 className="w-3 h-3" /> Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Restaurant Admin Dashboard ────────────────────────────────────────────────

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  onlineVsCOD: { online: number; cod: number; onlinePercentage: number };
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number }>;
  paymentStatus: string;
  status: string;
  total: number;
  createdAt: string;
}

const DASHBOARD_QUICK_LINKS: { label: string; href: string; featureKey?: keyof typeof DEFAULT_FEATURES }[] = [
  { label: 'Orders', href: '/admin/orders', featureKey: 'onlineOrdering' },
  { label: 'Menu', href: '/admin/menu', featureKey: 'menuManagement' },
  { label: 'Bookings', href: '/admin/bookings', featureKey: 'tableBooking' },
  { label: 'Hero / Front page', href: '/admin/hero-images', featureKey: 'heroImages' },
  { label: 'Revenue & business', href: '/admin/revenue', featureKey: 'billing' },
  { label: 'Payment details', href: '/admin/payments', featureKey: 'onlinePayments' },
  { label: 'Customers', href: '/admin/customers', featureKey: 'onlineOrdering' },
  { label: 'Staff & users', href: '/admin/users', featureKey: 'staffControl' },
  { label: 'Analytics', href: '/admin/analytics', featureKey: 'analytics' },
  { label: 'Settings & design', href: '/admin/settings' },
];
const DEFAULT_FEATURES = { menuManagement: true, onlineOrdering: true, tableBooking: false, billing: false, heroImages: true, analytics: false, staffControl: false, reviews: true, onlinePayments: true };

function RestaurantAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<Record<string, boolean> | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/admin/login'; return; }
      const headers = { Authorization: `Bearer ${token}` };
      const [statsData, ordersData, restaurantData] = await Promise.all([
        api.get<DashboardStats>('/analytics/dashboard', { headers }).catch(() => null),
        api.get<Order[]>('/orders', { headers, params: { limit: '10' } }).catch(() => []),
        api.get<{ features?: Record<string, boolean> }>('/restaurants/me', { headers }).catch((): { features?: Record<string, boolean> } => ({})),
      ]);
      setStats(statsData ?? null);
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 10) : []);
      const restFeatures = restaurantData && 'features' in restaurantData ? restaurantData.features : undefined;
      if (restFeatures && typeof restFeatures === 'object') {
        setFeatures(restFeatures);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
    } catch { alert('Failed to update order status'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { title: 'Today Orders', value: `${stats.todayOrders} Orders`, icon: ShoppingBag, color: 'bg-orange-600' },
    { title: 'Today Revenue', value: `₹${(stats.todayRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-green-600' },
    { title: 'Pending Orders', value: `${stats.pendingOrders} Orders`, icon: Clock, color: 'bg-orange-600' },
    { title: 'Online vs COD', value: `${stats.onlineVsCOD?.onlinePercentage ?? 0}%`, icon: CreditCard, color: 'bg-slate-800' },
  ] : [];

  const userName = typeof window !== 'undefined' ? (() => { try { return JSON.parse(localStorage.getItem('admin') || '{}').name; } catch { return 'Admin'; } })() : 'Admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Welcome, {userName} <span className="text-orange-600">🔥</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Your restaurant dashboard — orders, revenue & recent activity</p>
      </div>

      {/* Rental Admin: quick links — only show items enabled in subscription/plan */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Rental Admin Panel — You can</h2>
        <div className="flex flex-wrap gap-2">
          {DASHBOARD_QUICK_LINKS.filter((item) => {
            if (!item.featureKey) return true;
            const f = features ?? DEFAULT_FEATURES;
            return f[item.featureKey] === true;
          }).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.label === 'Orders' ? 'px-3 py-1.5 bg-orange-600/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-600/30' : 'px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600'}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            className={`${card.color} rounded-xl p-6 text-white shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">{card.title}</p>
                <h2 className="text-2xl font-bold">{card.value}</h2>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <card.icon className="w-8 h-8" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Payment</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-slate-800 hover:bg-slate-800 transition-colors">
                    <td className="py-4 px-4 text-white font-mono">#{order.orderNumber}</td>
                    <td className="py-4 px-4 text-white">{order.customerName}</td>
                    <td className="py-4 px-4 text-slate-300">{order.items.length} items</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.paymentStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
                      }`}>
                        {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {order.status === 'ready' && (
                          <button onClick={() => updateOrderStatus(order._id, 'completed')}
                            className="px-3 py-1 bg-orange-600 text-white rounded text-xs font-semibold hover:bg-orange-700">
                            Deliver
                          </button>
                        )}
                        {order.status !== 'completed' && (
                          <button onClick={() => updateOrderStatus(order._id, 'completed')}
                            className="px-3 py-1 bg-slate-700 text-white rounded text-xs font-semibold hover:bg-slate-600">
                            Complete
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <span className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Export — picks component based on role ───────────────────────────────

export default function AdminDashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      try { setRole(JSON.parse(stored).role); } catch {}
    }
  }, []);

  if (role === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
      </div>
    );
  }

  return role === 'super_admin' ? <SuperAdminDashboard /> : <RestaurantAdminDashboard />;
}
