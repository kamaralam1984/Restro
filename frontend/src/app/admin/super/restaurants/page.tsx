'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Store, Search, X, Power, Settings2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/super-admin/restaurants', form, { headers: headers() });
      setShowModal(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Restaurants</h1>
          <p className="text-slate-400 text-sm mt-1">{restaurants.length} restaurant(s) on platform</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Restaurant
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-left">
                <th className="py-4 px-5">Restaurant</th>
                <th className="py-4 px-5">Owner</th>
                <th className="py-4 px-5">Location</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Subscription</th>
                <th className="py-4 px-5">Joined</th>
                <th className="py-4 px-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No restaurants found
                  </td>
                </tr>
              ) : filtered.map((r) => (
                <tr key={r._id} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <Store className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{r.name}</div>
                        <div className="text-slate-500 text-xs">/{r.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="text-white text-sm">{r.ownerId?.name || '—'}</div>
                    <div className="text-slate-500 text-xs">{r.ownerId?.email || ''}</div>
                  </td>
                  <td className="py-4 px-5 text-slate-300">{r.city}, {r.state}</td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      r.status === 'active'
                        ? 'bg-green-600/20 text-green-400'
                        : r.status === 'suspended'
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}>{r.status}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      r.subscriptionStatus === 'active' ? 'bg-blue-600/20 text-blue-400' :
                      r.subscriptionStatus === 'trial' ? 'bg-orange-600/20 text-orange-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>{r.subscriptionStatus}</span>
                  </td>
                  <td className="py-4 px-5 text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/super/restaurants/${r._id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Settings2 className="w-3.5 h-3.5" /> Manage
                      </Link>
                      <button
                        onClick={() => toggleStatus(r._id, r.status)}
                        title={r.status === 'active' ? 'Suspend' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          r.status === 'active'
                            ? 'text-yellow-400 hover:bg-yellow-600/20'
                            : 'text-green-400 hover:bg-green-600/20'
                        }`}
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
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Add New Restaurant</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                {error && (
                  <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Restaurant Name *</label>
                    <input required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value, slug: handleSlugify(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="The Grand Kitchen" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Slug (URL) *</label>
                    <input required value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="the-grand-kitchen" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone *</label>
                    <input required value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+919876543210" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
                    <input value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="123 Main Street" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">City *</label>
                    <input required value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Mumbai" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">State *</label>
                    <input required value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Maharashtra" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Pincode</label>
                    <input value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="400001" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Plan</label>
                    <select value={form.planId}
                      onChange={(e) => setForm({ ...form, planId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">No Plan (Trial)</option>
                      {plans.map((p) => (
                        <option key={p._id} value={p._id}>{p.name} — ₹{p.price}/mo</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-5">
                  <p className="text-sm font-semibold text-slate-300 mb-4">Admin Account</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Name *</label>
                      <input required value={form.adminName}
                        onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Email *</label>
                      <input required type="email" value={form.adminEmail}
                        onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="admin@restaurant.com" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Password</label>
                      <input value={form.adminPassword}
                        onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Admin@123" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
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
