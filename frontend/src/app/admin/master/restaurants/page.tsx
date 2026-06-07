'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Store, Search, X, Power, Settings2, Copy, ExternalLink, Check } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { getRestaurantPublicLink } from '@/utils/restaurantLink';

interface Plan { _id: string; name: string; price: number; }
interface Restaurant {
  _id: string; name: string; slug: string; city: string; state: string;
  status: string; subscriptionStatus: string; trialEndsAt?: string;
  createdAt: string; phone: string;
  ownerId?: { name: string; email: string };
}

const EMPTY_FORM = {
  name: '', slug: '', phone: '', address: '', city: '', state: '', pincode: '',
  adminName: '', adminEmail: '', adminPassword: 'Admin@123', planId: '',
};

export default function SuperAdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [createdLink, setCreatedLink] = useState<{ name: string; slug: string; storeLink?: string; rentalAdminEmail?: string } | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const loadData = async () => {
    try {
      const [restData, plansData] = await Promise.all([
        api.get('/super-admin/restaurants?limit=100', { headers: headers() }),
        api.get('/super-admin/plans', { headers: headers() }),
      ]);
      setRestaurants(restData.restaurants || []);
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSlugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const copyLink = (slug: string) => {
    const url = getRestaurantPublicLink(slug);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post<{
        restaurant: { name: string; slug: string; storeLink?: string };
        storeLink?: string;
        adminUser?: { email: string; name: string };
      }>('/super-admin/restaurants', form, { headers: headers() });
      setShowModal(false);
      const link = res?.storeLink ?? res?.restaurant?.storeLink ?? (res?.restaurant ? getRestaurantPublicLink(res.restaurant.slug) : null);
      setCreatedLink(
        res?.restaurant
          ? {
              name: res.restaurant.name,
              slug: res.restaurant.slug,
              storeLink: link || undefined,
              rentalAdminEmail: res.adminUser?.email,
            }
          : null
      );
      setForm(EMPTY_FORM);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create restaurant');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/super-admin/restaurants/${id}/status`, { status: next }, { headers: headers() });
      setRestaurants((prev) => prev.map((r) => r._id === id ? { ...r, status: next } : r));
    } catch {}
  };

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.city.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    background: '#1c1c1c',
    border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#f8f4ed',
    outline: 'none',
    width: '100%',
    fontSize: 14,
  } as React.CSSProperties;

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#c8972a';
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)';
  };

  return (
    <div className="space-y-6">
      {/* Success: new restaurant + rental admin credentials */}
      <AnimatePresence>
        {createdLink && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl p-5 space-y-4"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <div>
              <p style={{ color: '#22c55e', fontWeight: 600 }}>Restaurant created — separate Rental Admin panel &amp; login</p>
              <p style={{ color: '#a89070', fontSize: 14, marginTop: 2 }}>{createdLink.name}</p>
            </div>
            {createdLink.rentalAdminEmail && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(28,28,28,0.9)' }}>
                <p style={{ color: '#f8f4ed', fontWeight: 500, marginBottom: 4 }}>Rental Admin Login (only for this restaurant)</p>
                <p style={{ color: '#f8f4ed' }}>ID: <code style={{ background: '#1c1c1c', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(200,151,42,0.2)' }}>{createdLink.rentalAdminEmail}</code></p>
                <p style={{ color: '#a89070', fontSize: 12, marginTop: 4 }}>Password: the one you set above. Share securely with the restaurant. This login opens only this restaurant&apos;s panel.</p>
              </div>
            )}
            <div className="flex items-center flex-wrap gap-3">
              <code
                className="text-sm truncate max-w-[280px]"
                style={{ color: '#f8f4ed', background: '#1c1c1c', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(200,151,42,0.2)' }}
                title={createdLink.storeLink || getRestaurantPublicLink(createdLink.slug)}
              >
                {createdLink.storeLink || getRestaurantPublicLink(createdLink.slug)}
              </code>
              <button
                type="button"
                onClick={() => {
                  const url = createdLink.storeLink || getRestaurantPublicLink(createdLink.slug);
                  navigator.clipboard.writeText(url).then(() => {
                    setCopiedSlug(createdLink.slug);
                    setTimeout(() => setCopiedSlug(null), 2000);
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                {copiedSlug === createdLink.slug ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedSlug === createdLink.slug ? 'Copied' : 'Copy link'}
              </button>
              <a
                href={createdLink.storeLink || getRestaurantPublicLink(createdLink.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: '#1c1c1c', color: '#f8f4ed', border: '1px solid rgba(200,151,42,0.2)' }}
              >
                <ExternalLink className="w-4 h-4" /> Open
              </a>
              <button
                type="button"
                onClick={() => setCreatedLink(null)}
                className="text-sm font-medium"
                style={{ color: '#a89070', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Restaurants</h1>
          <p className="text-sm mt-1" style={{ color: '#a89070' }}>{restaurants.length} restaurant(s) on platform</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808', border: 'none', cursor: 'pointer' }}
        >
          <Plus className="w-4 h-4" />
          Add Restaurant
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a89070' }} />
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm"
          style={{
            background: '#1c1c1c',
            border: '1px solid rgba(200,151,42,0.2)',
            borderRadius: 10,
            color: '#f8f4ed',
            outline: 'none',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="rounded-full h-10 w-10"
            style={{
              border: '3px solid rgba(200,151,42,0.2)',
              borderTopColor: '#c8972a',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left"
                style={{ background: '#1c1c1c', borderBottom: '1px solid rgba(200,151,42,0.15)' }}
              >
                {['Restaurant', 'Store link', 'Owner', 'Location', 'Status', 'Subscription', 'Joined', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="py-4 px-5"
                    style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12" style={{ color: '#a89070' }}>
                    No restaurants found
                  </td>
                </tr>
              ) : filtered.map((r) => (
                <tr
                  key={r._id}
                  style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1c1c1c')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#141414')}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(200,151,42,0.12)' }}
                      >
                        <Store className="w-4 h-4" style={{ color: '#c8972a' }} />
                      </div>
                      <div>
                        <div style={{ color: '#f8f4ed', fontWeight: 500 }}>{r.name}</div>
                        <div style={{ color: '#6b5040', fontSize: 12 }}>/{r.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyLink(r.slug)}
                        className="p-1.5 rounded-lg"
                        style={{ color: '#a89070', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
                        title="Copy store link"
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#f0c060')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#a89070')}
                      >
                        {copiedSlug === r.slug ? <Check className="w-4 h-4" style={{ color: '#22c55e' }} /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={getRestaurantPublicLink(r.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg"
                        style={{ color: '#a89070', transition: 'color 0.15s' }}
                        title="Open store"
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#f0c060')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#a89070')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <span
                        className="text-xs truncate max-w-[120px] block"
                        style={{ color: '#6b5040' }}
                        title={getRestaurantPublicLink(r.slug)}
                      >
                        /r/{r.slug}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div style={{ color: '#f8f4ed', fontSize: 14 }}>{r.ownerId?.name || '—'}</div>
                    <div style={{ color: '#6b5040', fontSize: 12 }}>{r.ownerId?.email || ''}</div>
                  </td>
                  <td className="py-4 px-5" style={{ color: '#a89070' }}>{r.city}, {r.state}</td>
                  <td className="py-4 px-5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={
                        r.status === 'active'
                          ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                          : r.status === 'suspended'
                          ? { background: 'rgba(240,192,96,0.1)', color: '#f0c060' }
                          : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={
                        r.subscriptionStatus === 'active'
                          ? { background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }
                          : r.subscriptionStatus === 'trial'
                          ? { background: 'rgba(240,192,96,0.1)', color: '#f0c060' }
                          : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                      }
                    >
                      {r.subscriptionStatus}
                    </span>
                  </td>
                  <td className="py-4 px-5" style={{ color: '#a89070' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/master/restaurants/${r._id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          background: 'rgba(200,151,42,0.12)',
                          color: '#c8972a',
                          border: '1px solid rgba(200,151,42,0.2)',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)';
                          (e.currentTarget as HTMLElement).style.color = '#080808';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.12)';
                          (e.currentTarget as HTMLElement).style.color = '#c8972a';
                        }}
                      >
                        <Settings2 className="w-3.5 h-3.5" /> Manage
                      </Link>
                      <button
                        onClick={() => toggleStatus(r._id, r.status)}
                        title={r.status === 'active' ? 'Suspend' : 'Activate'}
                        className="p-1.5 rounded-lg"
                        style={{
                          color: r.status === 'active' ? '#f0c060' : '#22c55e',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            r.status === 'active' ? 'rgba(240,192,96,0.1)' : 'rgba(34,197,94,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Restaurant Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.2)', borderRadius: 18, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                <h2 className="text-xl font-bold" style={{ color: '#f8f4ed' }}>Add New Restaurant</h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ color: '#a89070', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f8f4ed')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#a89070')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                {error && (
                  <div
                    className="px-4 py-3 rounded-lg text-sm"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
                  >
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>Restaurant Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value, slug: handleSlugify(e.target.value) })}
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="The Grand Kitchen"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>Slug (URL) *</label>
                    <input
                      required
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="the-grand-kitchen"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>Phone *</label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="+919876543210"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>Address</label>
                    <input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>City *</label>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>State *</label>
                    <input
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>Pincode</label>
                    <input
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="400001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>Plan</label>
                    <select
                      value={form.planId}
                      onChange={(e) => setForm({ ...form, planId: e.target.value })}
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    >
                      <option value="">No Plan (Trial)</option>
                      {plans.map((p) => (
                        <option key={p._id} value={p._id}>{p.name} — ₹{p.price}/mo</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-5" style={{ borderTop: '1px solid rgba(200,151,42,0.15)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#f8f4ed' }}>Rental Admin — ID &amp; Password (created from Super Admin)</p>
                  <p className="text-xs mb-4" style={{ color: '#6b5040' }}>Har restaurant ka alag login. Yeh ID/password sirf is restaurant ke Rental Admin panel ke liye use hoga.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>Rental Admin Name *</label>
                      <input
                        required
                        value={form.adminName}
                        onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                        style={inputStyle}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>Rental Admin ID (Email) *</label>
                      <input
                        required
                        type="email"
                        value={form.adminEmail}
                        onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                        style={inputStyle}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="admin@this-restaurant.com"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#a89070' }}>Rental Admin Password *</label>
                      <input
                        type="password"
                        value={form.adminPassword}
                        onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                        style={inputStyle}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Min 8 characters"
                      />
                      <p className="text-xs mt-1" style={{ color: '#6b5040' }}>Yeh password is restaurant ke panel ke liye. Create ke baad restaurant owner ko securely share karein.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ background: '#1c1c1c', color: '#f8f4ed', border: '1px solid rgba(200,151,42,0.2)', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.4)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold"
                    style={{
                      background: saving ? 'rgba(200,151,42,0.3)' : 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                      border: 'none',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? 'Creating...' : 'Create Restaurant'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
