'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Store, ShoppingBag, IndianRupee, UtensilsCrossed, Users,
  Calendar, Power, CheckCircle, XCircle, AlertTriangle, RefreshCw, KeyRound, Eye, EyeOff,
  Copy, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { getRestaurantPublicLink } from '@/utils/restaurantLink';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Features {
  onlineOrdering: boolean;
  tableBooking: boolean;
  billing: boolean;
  onlinePayments: boolean;
  reviews: boolean;
  heroImages: boolean;
  whatsappNotifications: boolean;
  analytics: boolean;
  staffControl?: boolean;
  menuManagement: boolean;
}

interface Restaurant {
  _id: string; name: string; slug: string; phone: string;
  address: string; city: string; state: string; country: string;
  status: 'active' | 'suspended' | 'inactive';
  subscriptionStatus: string; trialEndsAt?: string;
  createdAt: string; taxRate: number; serviceCharge: number;
  features?: Features;
  ownerId?: { _id: string; name: string; email: string; phone: string };
  currentPlanId?: { _id: string; name: string; price: number; features: any };
}

interface Stats {
  totalOrders: number; todayOrders: number;
  totalRevenue: number; todayRevenue: number;
  menuItems: number; staffCount: number;
  bookingsTotal: number; bookingsToday: number;
}

const DEFAULT_FEATURES: Features = {
  onlineOrdering: true, tableBooking: true, billing: true, onlinePayments: true,
  reviews: true, heroImages: true, whatsappNotifications: false,
  analytics: true, staffControl: false, menuManagement: true,
};

const FEATURE_META: { key: keyof Features; label: string; desc: string; icon: string }[] = [
  { key: 'onlineOrdering',        label: 'Online Ordering',        desc: 'Customers can place online food orders',          icon: '🛒' },
  { key: 'tableBooking',          label: 'Table Booking',          desc: 'Customers can book tables in advance',            icon: '📅' },
  { key: 'billing',               label: 'Billing',               desc: 'Admin can create bills (from order / offline)',   icon: '🧾' },
  { key: 'onlinePayments',        label: 'Online Payments',        desc: 'Accept Razorpay / online payments',              icon: '💳' },
  { key: 'menuManagement',        label: 'Menu Management',        desc: 'Admin can add / edit / delete menu items',       icon: '🍽️' },
  { key: 'reviews',               label: 'Customer Reviews',       desc: 'Customers can leave reviews and ratings',        icon: '⭐' },
  { key: 'heroImages',            label: 'Hero Carousel',          desc: 'Show hero images on the restaurant home page',   icon: '🖼️' },
  { key: 'whatsappNotifications', label: 'WhatsApp Notifications', desc: 'Send order / booking alerts via WhatsApp',       icon: '💬' },
  { key: 'analytics',             label: 'Analytics',              desc: 'Admin can view analytics and revenue reports',   icon: '📊' },
  { key: 'staffControl',          label: 'Staff Control',          desc: 'Manage staff and roles (Premium)',              icon: '👥' },
];

// ── FeatureToggle component ───────────────────────────────────────────────────

function FeatureToggle({
  label, desc, icon, enabled, saving, onChange,
}: {
  label: string; desc: string; icon: string;
  enabled: boolean; saving: boolean; onChange: (val: boolean) => void;
}) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
      enabled ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-900 border-slate-800 opacity-70'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-white text-sm font-semibold">{label}</div>
          <div className="text-slate-400 text-xs mt-0.5">{desc}</div>
        </div>
      </div>
      <button
        disabled={saving}
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          enabled ? 'bg-green-500' : 'bg-slate-600'
        } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RestaurantManagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [features, setFeatures] = useState<Features>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);
  const [featureSaving, setFeatureSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [resetSaving, setResetSaving] = useState(false);

  const headers = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const [restData, statsData] = await Promise.all([
        api.get(`/super-admin/restaurants/${id}`, { headers: headers() }),
        api.get(`/super-admin/restaurants/${id}/stats`, { headers: headers() }),
      ]);
      setRestaurant(restData);
      setStats(statsData);
      setFeatures({ ...DEFAULT_FEATURES, ...(restData.features || {}) });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, headers]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFeatureToggle = async (key: keyof Features, val: boolean) => {
    const updated = { ...features, [key]: val };
    setFeatures(updated);
    setFeatureSaving(true);
    try {
      await api.patch(`/super-admin/restaurants/${id}/features`, { features: updated }, { headers: headers() });
      showToast(`${FEATURE_META.find(f => f.key === key)?.label} ${val ? 'enabled' : 'disabled'}`);
    } catch {
      setFeatures(features); // revert
      showToast('Failed to update feature', 'error');
    } finally {
      setFeatureSaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setStatusSaving(true);
    try {
      await api.patch(`/super-admin/restaurants/${id}/status`, { status }, { headers: headers() });
      setRestaurant((prev) => prev ? { ...prev, status: status as any } : null);
      showToast(`Restaurant ${status}`);
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDisableAll = async () => {
    const allOff: Features = {
      onlineOrdering: false, tableBooking: false, onlinePayments: false,
      reviews: false, heroImages: false, whatsappNotifications: false,
      analytics: false, menuManagement: false,
    };
    setFeatures(allOff);
    setFeatureSaving(true);
    try {
      await api.patch(`/super-admin/restaurants/${id}/features`, { features: allOff }, { headers: headers() });
      showToast('All features disabled');
    } catch {
      showToast('Failed', 'error');
    } finally {
      setFeatureSaving(false);
    }
  };

  const handleEnableAll = async () => {
    const allOn = { ...DEFAULT_FEATURES };
    setFeatures(allOn);
    setFeatureSaving(true);
    try {
      await api.patch(`/super-admin/restaurants/${id}/features`, { features: allOn }, { headers: headers() });
      showToast('All features enabled');
    } catch {
      showToast('Failed', 'error');
    } finally {
      setFeatureSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    setResetSaving(true);
    try {
      const data = await api.post(
        `/super-admin/restaurants/${id}/reset-password`,
        { newPassword },
        { headers: headers() }
      );
      showToast(`Password reset for ${data.adminEmail}`);
      setShowResetModal(false);
      setNewPassword('');
    } catch (e: any) {
      showToast(e?.message || 'Failed to reset password', 'error');
    } finally {
      setResetSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>
  );

  if (!restaurant) return (
    <div className="text-center py-20 text-slate-400">Restaurant not found</div>
  );

  const isActive = restaurant.status === 'active';

  const statCards = stats ? [
    { label: 'Total Orders',    value: stats.totalOrders,   sub: `${stats.todayOrders} today`,      icon: ShoppingBag,    color: 'text-orange-400' },
    { label: 'Total Revenue',   value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, sub: `₹${stats.todayRevenue.toLocaleString('en-IN')} today`, icon: IndianRupee, color: 'text-green-400' },
    { label: 'Menu Items',      value: stats.menuItems,     sub: 'active items',                    icon: UtensilsCrossed, color: 'text-blue-400' },
    { label: 'Staff Members',   value: stats.staffCount,    sub: 'admin + staff',                   icon: Users,           color: 'text-purple-400' },
    { label: 'Total Bookings',  value: stats.bookingsTotal, sub: `${stats.bookingsToday} today`,    icon: Calendar,        color: 'text-cyan-400' },
  ] : [];

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </motion.div>
      )}

      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/super/restaurants"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="h-4 w-px bg-slate-700" />
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{restaurant.name}</h1>
            <p className="text-slate-400 text-xs">/{restaurant.slug} · {restaurant.city}, {restaurant.state}</p>
          </div>
        </div>
        <button onClick={loadData} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Status + Info strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Restaurant Info */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-5 border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Restaurant Info</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              { label: 'Owner', value: restaurant.ownerId?.name || '—' },
              { label: 'Owner Email', value: restaurant.ownerId?.email || '—' },
              { label: 'Phone', value: restaurant.phone },
              { label: 'Address', value: `${restaurant.address}, ${restaurant.city}` },
              { label: 'Plan', value: restaurant.currentPlanId?.name || 'No Plan' },
              { label: 'Tax Rate', value: `${restaurant.taxRate}%` },
              { label: 'Subscription', value: restaurant.subscriptionStatus },
              { label: 'Trial Ends', value: restaurant.trialEndsAt ? new Date(restaurant.trialEndsAt).toLocaleDateString('en-IN') : '—' },
              { label: 'Joined', value: new Date(restaurant.createdAt).toLocaleDateString('en-IN') },
            ].map((row) => (
              <div key={row.label}>
                <div className="text-slate-500 text-xs">{row.label}</div>
                <div className="text-white mt-0.5 truncate">{row.value}</div>
              </div>
            ))}
            <div className="col-span-2">
              <div className="text-slate-500 text-xs mb-1">Store link</div>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm text-slate-300 bg-slate-800 px-2 py-1 rounded truncate max-w-[200px]">
                  {getRestaurantPublicLink(restaurant.slug)}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getRestaurantPublicLink(restaurant.slug));
                    showToast('Link copied');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={getRestaurantPublicLink(restaurant.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                  title="Open store"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Status Control */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Status Control</h2>

          <div className="flex items-center gap-3 mb-5">
            <div className={`w-3 h-3 rounded-full ${
              restaurant.status === 'active' ? 'bg-green-500' :
              restaurant.status === 'suspended' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-semibold capitalize ${
              restaurant.status === 'active' ? 'text-green-400' :
              restaurant.status === 'suspended' ? 'text-yellow-400' : 'text-red-400'
            }`}>{restaurant.status}</span>
          </div>

          <div className="space-y-2 flex-1">
            <button disabled={statusSaving || restaurant.status === 'active'}
              onClick={() => handleStatusChange('active')}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
              <CheckCircle className="w-4 h-4" /> Activate
            </button>
            <button disabled={statusSaving || restaurant.status === 'suspended'}
              onClick={() => handleStatusChange('suspended')}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
              <AlertTriangle className="w-4 h-4" /> Suspend
            </button>
            <button disabled={statusSaving || restaurant.status === 'inactive'}
              onClick={() => handleStatusChange('inactive')}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
              <Power className="w-4 h-4" /> Deactivate
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <Link
              href={`/admin/super/subscriptions?restaurantId=${id}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" /> Renew subscription
            </Link>
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white">
              <KeyRound className="w-4 h-4" /> Reset Admin Password
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Reset Admin Password</h3>
                <p className="text-slate-400 text-xs mt-0.5">{restaurant.name}</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              This will reset the password for the restaurant&apos;s admin account. Share the new password securely.
            </p>

            <div className="relative mb-5">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowResetModal(false); setNewPassword(''); }}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetSaving || newPassword.length < 8}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetSaving ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Live Stats */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((card, i) => (
            <motion.div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs text-slate-400">{card.label}</span>
              </div>
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{card.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Controls */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Feature Controls</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enable or disable specific modules for this restaurant</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDisableAll} disabled={featureSaving}
              className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
              Disable All
            </button>
            <button onClick={handleEnableAll} disabled={featureSaving}
              className="px-3 py-1.5 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
              Enable All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FEATURE_META.map((f) => (
            <FeatureToggle
              key={f.key}
              label={f.label}
              desc={f.desc}
              icon={f.icon}
              enabled={features[f.key]}
              saving={featureSaving}
              onChange={(val) => handleFeatureToggle(f.key, val)}
            />
          ))}
        </div>
      </div>

      {/* Warning when suspended */}
      {!isActive && (
        <div className="flex items-center gap-3 bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-4 text-yellow-400 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <span className="font-semibold">Restaurant is {restaurant.status}.</span>
            {' '}Customers cannot access this restaurant. Activate it to restore service.
          </div>
        </div>
      )}
    </div>
  );
}
