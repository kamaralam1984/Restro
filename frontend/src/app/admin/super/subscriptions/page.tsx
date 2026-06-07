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
    { label: 'Active', value: stats.activeSubscriptions, icon: CheckCircle, bgStyle: { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)' }, iconColor: '#22c55e' },
    { label: 'On Trial', value: stats.restaurantsOnTrial, icon: TrendingUp, bgStyle: { background: 'rgba(200,151,42,0.12)', border: '1px solid rgba(200,151,42,0.25)' }, iconColor: '#c8972a' },
    { label: 'Expired', value: stats.expiredSubscriptions, icon: AlertTriangle, bgStyle: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }, iconColor: '#ef4444' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: CreditCard, bgStyle: { background: 'rgba(200,151,42,0.12)', border: '1px solid rgba(200,151,42,0.35)' }, iconColor: '#f0c060' },
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
      <div className="animate-spin rounded-full h-10 w-10" style={{ borderBottom: '2px solid #c8972a' }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Subscriptions</h1>
        <p className="text-sm mt-1" style={{ color: '#a89070' }}>Platform subscription overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            className="rounded-xl p-5"
            style={{ ...card.bgStyle, background: card.bgStyle.background }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs mb-1" style={{ color: '#a89070' }}>{card.label}</p>
                <h2 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>{card.value}</h2>
              </div>
              <div className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <card.icon className="w-6 h-6" style={{ color: card.iconColor }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: '#1c1c1c', borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
              <th className="py-4 px-5" style={{ color: '#a89070' }}>Restaurant</th>
              <th className="py-4 px-5" style={{ color: '#a89070' }}>Plan</th>
              <th className="py-4 px-5" style={{ color: '#a89070' }}>Amount</th>
              <th className="py-4 px-5" style={{ color: '#a89070' }}>Billing</th>
              <th className="py-4 px-5" style={{ color: '#a89070' }}>Status</th>
              <th className="py-4 px-5" style={{ color: '#a89070' }}>Start Date</th>
              <th className="py-4 px-5" style={{ color: '#a89070' }}>End Date</th>
              <th className="py-4 px-5 text-right" style={{ color: '#a89070' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12" style={{ color: '#a89070' }}>No subscriptions found</td>
              </tr>
            ) : subs.map((s, idx) => (
              <tr
                key={s._id}
                style={{
                  background: idx % 2 === 0 ? '#141414' : '#1a1a1a',
                  borderBottom: '1px solid rgba(200,151,42,0.08)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(200,151,42,0.06)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#141414' : '#1a1a1a'; }}
              >
                <td className="py-4 px-5">
                  <div className="font-medium" style={{ color: '#f8f4ed' }}>{s.restaurantId?.name || '—'}</div>
                  <div className="text-xs" style={{ color: '#6b5040' }}>{s.restaurantId?.city}</div>
                </td>
                <td className="py-4 px-5" style={{ color: '#a89070' }}>{s.planId?.name || '—'}</td>
                <td className="py-4 px-5 font-medium" style={{ color: '#f8f4ed' }}>₹{s.amount?.toLocaleString('en-IN')}</td>
                <td className="py-4 px-5 capitalize" style={{ color: '#a89070' }}>{s.billingCycle}</td>
                <td className="py-4 px-5">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={
                      s.status === 'active'
                        ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                        : s.status === 'expired'
                        ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                        : { background: 'rgba(240,192,96,0.1)', color: '#f0c060' }
                    }
                  >
                    {s.status}
                  </span>
                </td>
                <td className="py-4 px-5" style={{ color: '#a89070' }}>{new Date(s.startDate).toLocaleDateString('en-IN')}</td>
                <td className="py-4 px-5" style={{ color: '#a89070' }}>{s.endDate ? new Date(s.endDate).toLocaleDateString('en-IN') : '—'}</td>
                <td className="py-4 px-5 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                    style={{ background: '#1c1c1c', color: '#c8972a', border: '1px solid rgba(200,151,42,0.3)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,151,42,0.15)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,151,42,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1c';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,151,42,0.3)';
                    }}
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
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => !saving && setEditing(null)}
        >
          <div
            className="w-full max-w-md p-6 shadow-2xl rounded-xl"
            style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.2)', borderRadius: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#f8f4ed' }}>Edit subscription</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs mb-1" style={{ color: '#a89070' }}>Restaurant</p>
                <p className="font-medium" style={{ color: '#f8f4ed' }}>
                  {editing.restaurantId?.name ?? '—'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#a89070' }}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                    className="w-full rounded-lg text-sm"
                    style={{
                      background: '#1c1c1c',
                      border: '1px solid rgba(200,151,42,0.2)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      color: '#f8f4ed',
                      outline: 'none',
                    }}
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
                    className="rounded"
                    style={{ accentColor: '#c8972a' }}
                  />
                  <label htmlFor="autoRenew" className="text-xs" style={{ color: '#a89070' }}>
                    Auto renew
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#a89070' }}>End date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value }))}
                  className="w-full rounded-lg text-sm"
                  style={{
                    background: '#1c1c1c',
                    border: '1px solid rgba(200,151,42,0.2)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#f8f4ed',
                    outline: 'none',
                    colorScheme: 'dark',
                  } as React.CSSProperties}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ background: 'transparent', border: '1px solid rgba(200,151,42,0.3)', color: '#c8972a' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808', border: 'none' }}
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
