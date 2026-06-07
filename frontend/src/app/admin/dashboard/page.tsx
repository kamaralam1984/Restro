'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, IndianRupee, Clock, CreditCard, Store, Users, TrendingUp, AlertCircle, Settings2, CalendarCheck } from 'lucide-react';
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
    { title: 'Active Subscriptions', value: stats.activeSubscriptions, icon: CreditCard, cardStyle: { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }, iconBg: 'rgba(34,197,94,0.2)', valueColor: '#22c55e' },
    { title: 'On Trial', value: stats.restaurantsOnTrial, icon: Store, cardStyle: { background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)' }, iconBg: 'rgba(96,165,250,0.2)', valueColor: '#60a5fa' },
    { title: 'Expired', value: stats.expiredSubscriptions, icon: AlertCircle, cardStyle: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }, iconBg: 'rgba(239,68,68,0.2)', valueColor: '#ef4444' },
    { title: 'Total Revenue', value: `₹${(stats.totalRevenue / 100).toLocaleString('en-IN')}`, icon: IndianRupee, cardStyle: { background: 'rgba(200,151,42,0.12)', border: '1px solid rgba(200,151,42,0.25)' }, iconBg: 'rgba(200,151,42,0.2)', valueColor: '#f0c060' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
            style={{ border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }}
          />
          <p style={{ color: '#a89070' }}>Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Platform Overview</h1>
          <p className="text-sm mt-1" style={{ color: '#a89070' }}>Manage all restaurants and subscriptions</p>
        </div>
        <Link
          href="/admin/super/restaurants"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808', border: 'none' }}
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
            className="rounded-xl p-5"
            style={card.cardStyle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#a89070' }}>{card.title}</p>
                <h2 className="text-3xl font-bold" style={{ color: card.valueColor, fontWeight: 900 }}>{card.value}</h2>
              </div>
              <div className="p-3 rounded-lg" style={{ background: card.iconBg }}>
                <card.icon className="w-7 h-7" style={{ color: card.valueColor }} />
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
              className="rounded-xl p-5 cursor-pointer transition-all group"
              style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.35)')}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.13)')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(200,151,42,0.12)' }}
                >
                  <action.icon className="w-5 h-5" style={{ color: '#c8972a' }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: '#f8f4ed' }}>{action.label}</span>
              </div>
              <p className="text-xs" style={{ color: '#a89070' }}>{action.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Restaurants */}
      <div className="rounded-xl p-6" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: '#f8f4ed', fontWeight: 800 }}>Recent Restaurants</h2>
          <Link href="/admin/super/restaurants" className="text-sm transition-colors" style={{ color: '#c8972a' }}>
            View all →
          </Link>
        </div>
        {restaurants.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#a89070' }}>No restaurants yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1c1c1c', borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                  <th className="text-left py-3 px-2" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Restaurant</th>
                  <th className="text-left py-3 px-2" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>City</th>
                  <th className="text-left py-3 px-2" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</th>
                  <th className="text-left py-3 px-2" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Subscription</th>
                  <th className="text-left py-3 px-2" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Joined</th>
                  <th className="text-left py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr
                    key={r._id}
                    style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1c1c1c')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#141414')}
                  >
                    <td className="py-3 px-2 font-medium" style={{ color: '#f8f4ed' }}>{r.name}</td>
                    <td className="py-3 px-2" style={{ color: '#a89070' }}>{r.city}</td>
                    <td className="py-3 px-2">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={r.status === 'active'
                          ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                          : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                      >{r.status}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={r.subscriptionStatus === 'active'
                          ? { background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }
                          : r.subscriptionStatus === 'trial'
                          ? { background: 'rgba(240,192,96,0.1)', color: '#f0c060' }
                          : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                      >{r.subscriptionStatus}</span>
                    </td>
                    <td className="py-3 px-2" style={{ color: '#6b5040' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-2">
                      <Link
                        href={`/admin/super/restaurants/${r._id}`}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: 'rgba(200,151,42,0.1)', color: '#c8972a', border: '1px solid rgba(200,151,42,0.2)' }}
                      >
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
  { label: 'Tables', href: '/admin/tables', featureKey: 'tableBooking' },
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
  const [todayBookings, setTodayBookings] = useState<number>(0);
  const [totalTables, setTotalTables] = useState<number>(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/admin/login'; return; }
      const headers = { Authorization: `Bearer ${token}` };

      // Get restaurant slug for tables API
      let slug: string | undefined;
      try { slug = JSON.parse(localStorage.getItem('admin') || '{}').restaurantSlug; } catch {}

      const today = new Date().toISOString().split('T')[0];

      const [statsData, ordersData, restaurantData, bookingsData, tablesData] = await Promise.all([
        api.get<DashboardStats>('/analytics/dashboard', { headers }).catch(() => null),
        api.get<Order[]>('/orders', { headers, params: { limit: '10' } }).catch(() => []),
        api.get<{ features?: Record<string, boolean> }>('/restaurants/me', { headers }).catch((): { features?: Record<string, boolean> } => ({})),
        api.get<any[]>('/bookings', { headers, params: { date: today } }).catch(() => []),
        api.get<any[]>('/tables', { params: slug ? { restaurant: slug } : {} }).catch(() => []),
      ]);

      setStats(statsData ?? null);
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 10) : []);
      setTodayBookings(Array.isArray(bookingsData) ? bookingsData.length : 0);
      setTotalTables(Array.isArray(tablesData) ? tablesData.length : 0);

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
          <div
            className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
            style={{ border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }}
          />
          <p style={{ color: '#a89070' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Today Orders', value: `${stats?.todayOrders ?? 0}`, icon: ShoppingBag, cardStyle: { background: 'rgba(200,151,42,0.10)', border: '1px solid rgba(200,151,42,0.22)' }, iconBg: 'rgba(200,151,42,0.18)', valueColor: '#f0c060' },
    { title: 'Today Revenue', value: `₹${(stats?.todayRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, cardStyle: { background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)' }, iconBg: 'rgba(34,197,94,0.18)', valueColor: '#22c55e' },
    { title: 'Pending Orders', value: `${stats?.pendingOrders ?? 0}`, icon: Clock, cardStyle: { background: 'rgba(240,192,96,0.10)', border: '1px solid rgba(240,192,96,0.22)' }, iconBg: 'rgba(240,192,96,0.18)', valueColor: '#f0c060' },
    { title: "Today's Bookings", value: `${todayBookings}`, icon: CalendarCheck, cardStyle: { background: 'rgba(99,179,237,0.10)', border: '1px solid rgba(99,179,237,0.22)' }, iconBg: 'rgba(99,179,237,0.18)', valueColor: '#60a5fa' },
    { title: 'Total Tables', value: `${totalTables}`, icon: Store, cardStyle: { background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.22)' }, iconBg: 'rgba(167,139,250,0.18)', valueColor: '#a78bfa' },
    { title: 'Online vs COD', value: `${stats?.onlineVsCOD?.onlinePercentage ?? 0}%`, icon: CreditCard, cardStyle: { background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }, iconBg: 'rgba(200,151,42,0.12)', valueColor: '#c8972a' },
  ];

  const userName = typeof window !== 'undefined' ? (() => { try { return JSON.parse(localStorage.getItem('admin') || '{}').name; } catch { return 'Admin'; } })() : 'Admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#f8f4ed' }}>
          Welcome, {userName} <span style={{ color: '#c8972a' }}>🔥</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#a89070' }}>Your restaurant dashboard — orders, revenue & recent activity</p>
      </div>

      {/* Rental Admin: quick links — only show items enabled in subscription/plan */}
      <div className="rounded-xl p-5" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#a89070' }}>Rental Admin Panel — You can</h2>
        <div className="flex flex-wrap gap-2">
          {DASHBOARD_QUICK_LINKS.filter((item) => {
            if (!item.featureKey) return true;
            const f = features ?? DEFAULT_FEATURES;
            return f[item.featureKey] === true;
          }).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={item.label === 'Orders'
                ? { background: 'rgba(200,151,42,0.12)', color: '#c8972a', border: '1px solid rgba(200,151,42,0.2)' }
                : { background: '#1c1c1c', color: '#a89070', border: '1px solid rgba(200,151,42,0.1)' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            className="rounded-xl p-4 shadow-lg"
            style={{ ...card.cardStyle }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#a89070' }}>{card.title}</p>
                <h2 className="text-2xl font-bold" style={{ color: card.valueColor, fontWeight: 900 }}>{card.value}</h2>
              </div>
              <div className="p-3 rounded-lg" style={{ background: card.iconBg }}>
                <card.icon className="w-8 h-8" style={{ color: card.valueColor }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl p-6" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#a89070' }}>No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1c1c1c', borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Order ID</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Customer</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Items</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Payment</th>
                  <th className="text-left py-3 px-4" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="transition-colors"
                    style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1c1c1c')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#141414')}
                  >
                    <td className="py-4 px-4 font-mono" style={{ color: '#f0c060' }}>#{order.orderNumber}</td>
                    <td className="py-4 px-4" style={{ color: '#f8f4ed' }}>{order.customerName}</td>
                    <td className="py-4 px-4" style={{ color: '#a89070' }}>{order.items.length} items</td>
                    <td className="py-4 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={order.paymentStatus === 'paid'
                          ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
                          : { background: 'rgba(200,151,42,0.15)', color: '#f0c060' }}
                      >
                        {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'completed')}
                            className="px-3 py-1 rounded text-xs font-semibold transition-colors"
                            style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808', border: 'none' }}
                          >
                            Deliver
                          </button>
                        )}
                        {order.status !== 'completed' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'completed')}
                            className="px-3 py-1 rounded text-xs font-semibold transition-colors"
                            style={{ background: '#1c1c1c', color: '#a89070', border: '1px solid rgba(200,151,42,0.15)' }}
                          >
                            Complete
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <span
                            className="px-3 py-1 rounded text-xs font-semibold"
                            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
                          >Completed</span>
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
        <div
          className="animate-spin rounded-full h-10 w-10"
          style={{ border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }}
        />
      </div>
    );
  }

  return role === 'super_admin' ? <SuperAdminDashboard /> : <RestaurantAdminDashboard />;
}
