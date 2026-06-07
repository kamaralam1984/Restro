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
  onlinePayments: boolean;
  reviews: boolean;
  heroImages: boolean;
  whatsappNotifications: boolean;
  analytics: boolean;
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
  onlineOrdering: true, tableBooking: true, onlinePayments: true,
  reviews: true, heroImages: true, whatsappNotifications: false,
  analytics: true, menuManagement: true,
};

const FEATURE_META: { key: keyof Features; label: string; desc: string; icon: string }[] = [
  { key: 'onlineOrdering',        label: 'Online Ordering',        desc: 'Customers can place online food orders',          icon: '🛒' },
  { key: 'tableBooking',          label: 'Table Booking',          desc: 'Customers can book tables in advance',            icon: '📅' },
  { key: 'onlinePayments',        label: 'Online Payments',        desc: 'Accept Razorpay / online payments',              icon: '💳' },
  { key: 'menuManagement',        label: 'Menu Management',        desc: 'Admin can add / edit / delete menu items',       icon: '🍽️' },
  { key: 'reviews',               label: 'Customer Reviews',       desc: 'Customers can leave reviews and ratings',        icon: '⭐' },
  { key: 'heroImages',            label: 'Hero Carousel',          desc: 'Show hero images on the restaurant home page',   icon: '🖼️' },
  { key: 'whatsappNotifications', label: 'WhatsApp Notifications', desc: 'Send order / booking alerts via WhatsApp',       icon: '💬' },
  { key: 'analytics',             label: 'Analytics',              desc: 'Admin can view analytics and revenue reports',   icon: '📊' },
];

// ── FeatureToggle component ───────────────────────────────────────────────────

function FeatureToggle({
  label, desc, icon, enabled, saving, onChange,
}: {
  label: string; desc: string; icon: string;
  enabled: boolean; saving: boolean; onChange: (val: boolean) => void;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      borderRadius: '12px',
      border: enabled ? '1px solid rgba(200,151,42,0.3)' : '1px solid rgba(200,151,42,0.1)',
      background: enabled ? '#1c1c1c' : '#141414',
      opacity: enabled ? 1 : 0.7,
      transition: 'all 0.2s',
    }}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div style={{ color: '#f8f4ed', fontSize: '14px', fontWeight: 600 }}>{label}</div>
          <div style={{ color: '#a89070', fontSize: '12px', marginTop: '2px' }}>{desc}</div>
        </div>
      </div>
      <button
        disabled={saving}
        onClick={() => onChange(!enabled)}
        style={{
          position: 'relative',
          width: '48px',
          height: '24px',
          borderRadius: '9999px',
          border: 'none',
          background: enabled ? '#22c55e' : '#3a3a3a',
          flexShrink: 0,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.5 : 1,
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute',
          top: '2px',
          left: enabled ? '26px' : '2px',
          width: '20px',
          height: '20px',
          borderRadius: '9999px',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transition: 'left 0.2s',
        }} />
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
      <div style={{
        width: '48px', height: '48px', borderRadius: '9999px',
        border: '3px solid rgba(200,151,42,0.2)',
        borderTopColor: '#c8972a',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );

  if (!restaurant) return (
    <div className="text-center py-20" style={{ color: '#a89070' }}>Restaurant not found</div>
  );

  const isActive = restaurant.status === 'active';

  const statCards = stats ? [
    { label: 'Total Orders',    value: stats.totalOrders,   sub: `${stats.todayOrders} today`,      icon: ShoppingBag,    color: '#c8972a' },
    { label: 'Total Revenue',   value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, sub: `₹${stats.todayRevenue.toLocaleString('en-IN')} today`, icon: IndianRupee, color: '#22c55e' },
    { label: 'Menu Items',      value: stats.menuItems,     sub: 'active items',                    icon: UtensilsCrossed, color: '#60a5fa' },
    { label: 'Staff Members',   value: stats.staffCount,    sub: 'admin + staff',                   icon: Users,           color: '#f0c060' },
    { label: 'Total Bookings',  value: stats.bookingsTotal, sub: `${stats.bookingsToday} today`,    icon: Calendar,        color: '#22d3ee' },
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
          style={
            toast.type === 'success'
              ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }
              : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }
          }
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </motion.div>
      )}

      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/master/restaurants"
          className="flex items-center gap-2 transition-colors text-sm"
          style={{ color: '#a89070' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f8f4ed')}
          onMouseLeave={e => (e.currentTarget.style.color = '#a89070')}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="h-4 w-px" style={{ background: 'rgba(200,151,42,0.2)' }} />
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(200,151,42,0.12)' }}>
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
          style={{ color: '#a89070', background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f8f4ed'; (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1c'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a89070'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Status + Info strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Restaurant Info */}
        <div className="lg:col-span-2 rounded-xl p-5"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: '#a89070' }}>Restaurant Info</h2>
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
                <div style={{ color: '#6b5040', fontSize: '12px' }}>{row.label}</div>
                <div className="mt-0.5 truncate" style={{ color: '#f8f4ed' }}>{row.value}</div>
              </div>
            ))}
            <div className="col-span-2">
              <div style={{ color: '#6b5040', fontSize: '12px', marginBottom: '4px' }}>Store link</div>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm px-2 py-1 rounded truncate max-w-[200px]"
                  style={{ color: '#f0c060', background: '#1c1c1c' }}>
                  {getRestaurantPublicLink(restaurant.slug)}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getRestaurantPublicLink(restaurant.slug));
                    showToast('Link copied');
                  }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#a89070', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f8f4ed'; (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1c'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a89070'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
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
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#f8f4ed'; (e.currentTarget as HTMLAnchorElement).style.background = '#1c1c1c'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#a89070'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                  title="Open store"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Status Control */}
        <div className="rounded-xl p-5 flex flex-col"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: '#a89070' }}>Status Control</h2>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-3 h-3 rounded-full" style={{
              background: restaurant.status === 'active' ? '#22c55e' :
                restaurant.status === 'suspended' ? '#f0c060' : '#ef4444',
            }} />
            <span className="text-sm font-semibold capitalize" style={{
              color: restaurant.status === 'active' ? '#22c55e' :
                restaurant.status === 'suspended' ? '#f0c060' : '#ef4444',
            }}>{restaurant.status}</span>
          </div>

          <div className="space-y-2 flex-1">
            <button disabled={statusSaving || restaurant.status === 'active'}
              onClick={() => handleStatusChange('active')}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: 'rgba(34,197,94,0.1)',
                color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.2)',
                cursor: (statusSaving || restaurant.status === 'active') ? 'not-allowed' : 'pointer',
                opacity: (statusSaving || restaurant.status === 'active') ? 0.4 : 1,
              }}>
              <CheckCircle className="w-4 h-4" /> Activate
            </button>
            <button disabled={statusSaving || restaurant.status === 'suspended'}
              onClick={() => handleStatusChange('suspended')}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: 'rgba(240,192,96,0.1)',
                color: '#f0c060',
                border: '1px solid rgba(240,192,96,0.2)',
                cursor: (statusSaving || restaurant.status === 'suspended') ? 'not-allowed' : 'pointer',
                opacity: (statusSaving || restaurant.status === 'suspended') ? 0.4 : 1,
              }}>
              <AlertTriangle className="w-4 h-4" /> Suspend
            </button>
            <button disabled={statusSaving || restaurant.status === 'inactive'}
              onClick={() => handleStatusChange('inactive')}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.2)',
                cursor: (statusSaving || restaurant.status === 'inactive') ? 'not-allowed' : 'pointer',
                opacity: (statusSaving || restaurant.status === 'inactive') ? 0.4 : 1,
              }}>
              <Power className="w-4 h-4" /> Deactivate
            </button>
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(200,151,42,0.15)' }}>
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: 'rgba(200,151,42,0.08)',
                color: '#c8972a',
                border: '1px solid rgba(200,151,42,0.2)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,151,42,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,151,42,0.08)'; }}
            >
              <KeyRound className="w-4 h-4" /> Reset Admin Password
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md mx-4"
            style={{
              background: '#141414',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(200,151,42,0.12)' }}>
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
                style={{
                  width: '100%',
                  paddingLeft: '16px',
                  paddingRight: '40px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  background: '#1c1c1c',
                  border: '1px solid rgba(200,151,42,0.2)',
                  borderRadius: '10px',
                  color: '#f8f4ed',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = '#c8972a')}
                onBlur={e => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#a89070', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f8f4ed')}
                onMouseLeave={e => (e.currentTarget.style.color = '#a89070')}
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
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#242424'; (e.currentTarget as HTMLButtonElement).style.color = '#f8f4ed'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1c'; (e.currentTarget as HTMLButtonElement).style.color = '#a89070'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetSaving || newPassword.length < 8}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: (resetSaving || newPassword.length < 8) ? 'rgba(200,151,42,0.3)' : 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                  color: '#080808',
                  border: 'none',
                  cursor: (resetSaving || newPassword.length < 8) ? 'not-allowed' : 'pointer',
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
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3"
          style={{ color: '#a89070' }}>Live Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((card, i) => (
            <motion.div key={i}
              className="rounded-xl p-4"
              style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: '#a89070' }}>Feature Controls</h2>
            <p className="text-xs mt-0.5" style={{ color: '#6b5040' }}>Enable or disable specific modules for this restaurant</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDisableAll} disabled={featureSaving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.25)',
                cursor: featureSaving ? 'not-allowed' : 'pointer',
                opacity: featureSaving ? 0.5 : 1,
              }}>
              Disable All
            </button>
            <button onClick={handleEnableAll} disabled={featureSaving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: 'rgba(34,197,94,0.1)',
                color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.2)',
                cursor: featureSaving ? 'not-allowed' : 'pointer',
                opacity: featureSaving ? 0.5 : 1,
              }}>
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
        <div className="flex items-center gap-3 rounded-xl p-4 text-sm"
          style={{
            background: 'rgba(240,192,96,0.1)',
            border: '1px solid rgba(240,192,96,0.25)',
            color: '#f0c060',
          }}>
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
