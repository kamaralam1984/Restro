'use client';

import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';

interface Stats {
  activeSubscriptions: number; expiredSubscriptions: number;
  restaurantsOnTrial: number; totalRevenue: number;
}
interface Subscription {
  _id: string; status: string; amount: number; billingCycle: string;
  startDate: string; endDate?: string;
  restaurantId?: { name: string; city: string };
  planId?: { name: string; price: number };
  autoRenew?: boolean;
}

export default function SuperAdminSubscriptionsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ status: string; autoRenew: boolean; endDate: string }>({
    status: 'active',
    autoRenew: true,
    endDate: '',
  });

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const load = async () => {
    try {
      const [statsData, subsData] = await Promise.all([
        api.get<Stats>('/super-admin/subscriptions/stats', { headers: headers() }),
        api.get<{ subscriptions: Subscription[] }>('/super-admin/subscriptions?limit=50', { headers: headers() }),
      ]);
      setStats(statsData);
      setSubs(subsData.subscriptions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {
      setStats(null);
      setSubs([]);
      setLoading(false);
    });
  }, []);

  const statCards = stats ? [
    { label: 'Active', value: stats.activeSubscriptions, icon: CheckCircle, color: 'bg-green-600' },
    { label: 'On Trial', value: stats.restaurantsOnTrial, icon: TrendingUp, color: 'bg-blue-600' },
    { label: 'Expired', value: stats.expiredSubscriptions, icon: AlertTriangle, color: 'bg-red-600' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: CreditCard, color: 'bg-purple-600' },
  ] : [];

  const openEdit = (sub: Subscription) => {
    setEditing(sub);
    setForm({
      status: sub.status,
      autoRenew: sub.autoRenew ?? true,
      endDate: sub.endDate ? new Date(sub.endDate).toISOString().slice(0, 10) : '',
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.patch(
        `/super-admin/subscriptions/${editing._id}`,
        {
          status: form.status,
          autoRenew: form.autoRenew,
          endDate: form.endDate || undefined,
        },
        { headers: headers() }
      );
      setEditing(null);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-slate-400 text-sm mt-1">Platform subscription overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} className={`${card.color} rounded-xl p-5 text-white`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-80 mb-1">{card.label}</p>
                <h2 className="text-2xl font-bold">{card.value}</h2>
              </div>
              <div className="bg-white/20 p-2.5 rounded-lg"><card.icon className="w-6 h-6" /></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 text-left">
              <th className="py-4 px-5">Restaurant</th>
              <th className="py-4 px-5">Plan</th>
              <th className="py-4 px-5">Amount</th>
              <th className="py-4 px-5">Billing</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5">Start Date</th>
              <th className="py-4 px-5">End Date</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">No subscriptions found</td></tr>
            ) : subs.map((s) => (
              <tr key={s._id} className="border-b border-slate-800 hover:bg-slate-800/40">
                <td className="py-4 px-5">
                  <div className="text-white font-medium">{s.restaurantId?.name || '—'}</div>
                  <div className="text-slate-500 text-xs">{s.restaurantId?.city}</div>
                </td>
                <td className="py-4 px-5 text-slate-300">{s.planId?.name || '—'}</td>
                <td className="py-4 px-5 text-white font-medium">₹{s.amount?.toLocaleString('en-IN')}</td>
                <td className="py-4 px-5 text-slate-300 capitalize">{s.billingCycle}</td>
                <td className="py-4 px-5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    s.status === 'active' ? 'bg-green-600/20 text-green-400' :
                    s.status === 'expired' ? 'bg-red-600/20 text-red-400' :
                    'bg-yellow-600/20 text-yellow-400'
                  }`}>{s.status}</span>
                </td>
                <td className="py-4 px-5 text-slate-400">{new Date(s.startDate).toLocaleDateString('en-IN')}</td>
                <td className="py-4 px-5 text-slate-400">{s.endDate ? new Date(s.endDate).toLocaleDateString('en-IN') : '—'}</td>
                <td className="py-4 px-5 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 text-xs hover:bg-purple-600/80 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !saving && setEditing(null)}
        >
          <div
            className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Edit subscription</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-1">Restaurant</p>
                <p className="text-white font-medium">
                  {editing.restaurantId?.name ?? '—'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="past_due">Past due</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input
                    id="autoRenew"
                    type="checkbox"
                    checked={form.autoRenew}
                    onChange={(e) => setForm((s) => ({ ...s, autoRenew: e.target.checked }))}
                    className="rounded border-slate-600 bg-slate-800"
                  />
                  <label htmlFor="autoRenew" className="text-slate-300 text-xs">
                    Auto renew
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">End date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
