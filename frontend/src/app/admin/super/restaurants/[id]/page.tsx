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
    <div
      className="flex items-center justify-between p-4 rounded-xl border transition-all"
      style={{
        background: enabled ? 'rgba(200,151,42,0.08)' : '#141414',
        borderColor: enabled ? 'rgba(200,151,42,0.35)' : 'rgba(200,151,42,0.15)',
        opacity: enabled ? 1 : 0.7,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-sm font-semibold" style={{ color: '#f8f4ed' }}>{label}</div>
          <div className="text-xs mt-0.5" style={{ color: '#a89070' }}>{desc}</div>
        </div>
      </div>
      <button
        disabled={saving}
        onClick={() => onChange(!enabled)}
        className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{
          background: enabled ? '#22c55e' : 'rgba(200,151,42,0.2)',
          opacity: saving ? 0.5 : 1,
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200"
          style={{
            background: '#f8f4ed',
            transform: enabled ? 'translateX(1.5rem)' : 'translateX(0.125rem)',
          }}
        />
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
  const [featuresDirty, setFeaturesDirty] = useState(false);
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
      setFeaturesDirty(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, headers]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFeatureToggle = (key: keyof Features, val: boolean) => {
    setFeatures((prev) => ({ ...prev, [key]: val }));
    setFeaturesDirty(true);
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

  const handleDisableAll = () => {
    setFeatures({
      onlineOrdering: false, tableBooking: false, billing: false, onlinePayments: false,
      reviews: false, heroImages: false, whatsappNotifications: false,
      analytics: false, staffControl: false, menuManagement: false,
    });
    setFeaturesDirty(true);
  };

  const handleEnableAll = () => {
    setFeatures({ ...DEFAULT_FEATURES });
    setFeaturesDirty(true);
  };

  const handleSaveFeatures = async () => {
    setFeatureSaving(true);
    try {
      await api.patch(`/super-admin/restaurants/${id}/features`, { features }, { headers: headers() });
      setFeaturesDirty(false);
      showToast('Feature controls saved. Subscription plan limits which features can be enabled.');
    } catch {
      showToast('Failed to save features', 'error');
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
      <div
        className="animate-spin rounded-full h-12 w-12"
        style={{ border: '2px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }}
      />
    </div>
  );

  if (!restaurant) return (
    <div className="text-center py-20" style={{ color: '#a89070' }}>Restaurant not found</div>
  );

  const isActive = restaurant.status === 'active';

  const statCards = stats ? [
    { label: 'Total Orders',    value: stats.totalOrders,   sub: `${stats.todayOrders} today`,      icon: ShoppingBag,    color: '#c8972a' },
    { label: 'Total Revenue',   value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, sub: `₹${stats.todayRevenue.toLocaleString('en-IN')} today`, icon: IndianRupee, color: '#22c55e' },
    { label: 'Menu Items',      value: stats.menuItems,     sub: 'active items',                    icon: UtensilsCrossed, color: '#f0c060' },
    { label: 'Staff Members',   value: stats.staffCount,    sub: 'admin + staff',                   icon: Users,           color: '#c8972a' },
    { label: 'Total Bookings',  value: stats.bookingsTotal, sub: `${stats.bookingsToday} today`,    icon: Calendar,        color: '#f0c060' },
  ] : [];

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl flex items-center gap-2"
          style={{
            background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: toast.type === 'success' ? '#22c55e' : '#ef4444',
            border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </motion.div>
      )}

      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/super/restaurants"
          className="flex items-center gap-2 transition-colors text-sm"
          style={{ color: '#a89070' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="h-4 w-px" style={{ background: 'rgba(200,151,42,0.2)' }} />
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(200,151,42,0.12)' }}
          >
            <Store className="w-5 h-5" style={{ color: '#c8972a' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#f8f4ed' }}>{restaurant.name}</h1>
            <p className="text-xs" style={{ color: '#a89070' }}>/{restaurant.slug} · {restaurant.city}, {restaurant.state}</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#a89070' }}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Status + Info strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Restaurant Info */}
        <div
          className="lg:col-span-2 rounded-xl p-5"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#a89070' }}>Restaurant Info</h2>
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
                <div className="text-xs" style={{ color: '#6b5040' }}>{row.label}</div>
                <div className="mt-0.5 truncate" style={{ color: '#f8f4ed' }}>{row.value}</div>
              </div>
            ))}
            <div className="col-span-2">
              <div className="text-xs mb-1" style={{ color: '#6b5040' }}>Store link</div>
              <div className="flex items-center gap-2 flex-wrap">
                <code
                  className="text-sm px-2 py-1 rounded truncate max-w-[200px]"
                  style={{ color: '#f0c060', background: '#1c1c1c' }}
                >
                  {getRestaurantPublicLink(restaurant.slug)}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getRestaurantPublicLink(restaurant.slug));
                    showToast('Link copied');
                  }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#a89070' }}
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={getRestaurantPublicLink(restaurant.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#a89070' }}
                  title="Open store"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Status Control */}
        <div
          className="rounded-xl p-5 flex flex-col"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#a89070' }}>Status Control</h2>

          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background:
                  restaurant.status === 'active' ? '#22c55e' :
                  restaurant.status === 'suspended' ? '#f0c060' : '#ef4444',
              }}
            />
            <span
              className="text-sm font-semibold capitalize"
              style={{
                color:
                  restaurant.status === 'active' ? '#22c55e' :
                  restaurant.status === 'suspended' ? '#f0c060' : '#ef4444',
              }}
            >
              {restaurant.status}
            </span>
          </div>

          <div className="space-y-2 flex-1">
            <button
              disabled={statusSaving || restaurant.status === 'active'}
              onClick={() => handleStatusChange('active')}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed"
              style={{
                background: 'rgba(34,197,94,0.1)',
                color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.2)',
                opacity: (statusSaving || restaurant.status === 'active') ? 0.4 : 1,
              }}
            >
              <CheckCircle className="w-4 h-4" /> Activate
            </button>
            <button
              disabled={statusSaving || restaurant.status === 'suspended'}
              onClick={() => handleStatusChange('suspended')}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed"
              style={{
                background: 'rgba(240,192,96,0.1)',
                color: '#f0c060',
                border: '1px solid rgba(240,192,96,0.2)',
                opacity: (statusSaving || restaurant.status === 'suspended') ? 0.4 : 1,
              }}
            >
              <AlertTriangle className="w-4 h-4" /> Suspend
            </button>
            <button
              disabled={statusSaving || restaurant.status === 'inactive'}
              onClick={() => handleStatusChange('inactive')}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.2)',
                opacity: (statusSaving || restaurant.status === 'inactive') ? 0.4 : 1,
              }}
            >
              <Power className="w-4 h-4" /> Deactivate
            </button>
          </div>

          <div
            className="mt-4 pt-4 space-y-2"
            style={{ borderTop: '1px solid rgba(200,151,42,0.15)' }}
          >
            <Link
              href={`/admin/super/subscriptions?restaurantId=${id}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: 'rgba(200,151,42,0.1)',
                color: '#c8972a',
                border: '1px solid rgba(200,151,42,0.3)',
              }}
            >
              <RefreshCw className="w-4 h-4" /> Renew subscription
            </Link>
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: '#1c1c1c',
                color: '#a89070',
                border: '1px solid rgba(200,151,42,0.15)',
              }}
            >
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
            className="rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
            style={{
              background: '#141414',
              border: '1px solid rgba(200,151,42,0.2)',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(200,151,42,0.12)' }}
              >
                <KeyRound className="w-5 h-5" style={{ color: '#c8972a' }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: '#f8f4ed' }}>Reset Admin Password</h3>
                <p className="text-xs mt-0.5" style={{ color: '#a89070' }}>{restaurant.name}</p>
              </div>
            </div>

            <p className="text-sm mb-4" style={{ color: '#a89070' }}>
              This will reset the password for the restaurant&apos;s admin account. Share the new password securely.
            </p>

            <div className="relative mb-5">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="w-full pr-10"
                style={{
                  background: '#1c1c1c',
                  border: '1px solid rgba(200,151,42,0.2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#f8f4ed',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#a89070' }}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowResetModal(false); setNewPassword(''); }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: '#1c1c1c',
                  color: '#a89070',
                  border: '1px solid rgba(200,151,42,0.15)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetSaving || newPassword.length < 8}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                  color: '#080808',
                  border: 'none',
                  opacity: (resetSaving || newPassword.length < 8) ? 0.5 : 1,
                }}
              >
                {resetSaving ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Live Stats */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#a89070' }}>Live Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              className="rounded-xl p-4"
              style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
                <span className="text-xs" style={{ color: '#a89070' }}>{card.label}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: card.color }}>{card.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#6b5040' }}>{card.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Controls */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#a89070' }}>Feature Controls</h2>
            <p className="text-xs mt-0.5" style={{ color: '#6b5040' }}>Enable or disable modules as per subscription plan. Click Save to apply changes.</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={handleDisableAll}
              disabled={featureSaving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.2)',
                opacity: featureSaving ? 0.5 : 1,
              }}
            >
              Disable All
            </button>
            <button
              onClick={handleEnableAll}
              disabled={featureSaving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: 'rgba(34,197,94,0.1)',
                color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.2)',
                opacity: featureSaving ? 0.5 : 1,
              }}
            >
              Enable All
            </button>
            <button
              onClick={handleSaveFeatures}
              disabled={!featuresDirty || featureSaving}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                color: '#080808',
                border: 'none',
                opacity: (!featuresDirty || featureSaving) ? 0.5 : 1,
              }}
            >
              {featureSaving ? 'Saving...' : featuresDirty ? 'Save changes' : 'Saved'}
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
              enabled={features[f.key] ?? false}
              saving={featureSaving}
              onChange={(val) => handleFeatureToggle(f.key, val)}
            />
          ))}
        </div>
      </div>

      {/* Warning when suspended */}
      {!isActive && (
        <div
          className="flex items-center gap-3 rounded-xl p-4 text-sm"
          style={{
            background: 'rgba(240,192,96,0.08)',
            border: '1px solid rgba(240,192,96,0.25)',
            color: '#f0c060',
          }}
        >
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
