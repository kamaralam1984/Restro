'use client';

import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
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
}

export default function MasterAdminSubscriptionsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, subsData] = await Promise.all([
          api.get('/super-admin/subscriptions/stats', { headers: headers() }),
          api.get('/super-admin/subscriptions?limit=50', { headers: headers() }),
        ]);
        setStats(statsData);
        setSubs(subsData.subscriptions || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = stats ? [
    { label: 'Active', value: stats.activeSubscriptions, icon: CheckCircle, iconColor: '#22c55e', bgColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.25)' },
    { label: 'On Trial', value: stats.restaurantsOnTrial, icon: TrendingUp, iconColor: '#60a5fa', bgColor: 'rgba(96,165,250,0.1)', borderColor: 'rgba(96,165,250,0.25)' },
    { label: 'Expired', value: stats.expiredSubscriptions, icon: AlertTriangle, iconColor: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: CreditCard, iconColor: '#f0c060', bgColor: 'rgba(200,151,42,0.1)', borderColor: 'rgba(200,151,42,0.3)' },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10" style={{ border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }} />
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
          <motion.div key={i} className="rounded-xl p-5"
            style={{ background: '#141414', border: `1px solid ${card.borderColor}` }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs mb-1" style={{ color: '#a89070' }}>{card.label}</p>
                <h2 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>{card.value}</h2>
              </div>
              <div className="p-2.5 rounded-lg" style={{ background: card.bgColor }}>
                <card.icon className="w-6 h-6" style={{ color: card.iconColor }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ background: '#1c1c1c', borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
              <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Restaurant</th>
              <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Plan</th>
              <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Amount</th>
              <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Billing</th>
              <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</th>
              <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Start Date</th>
              <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>End Date</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12" style={{ color: '#a89070' }}>No subscriptions found</td></tr>
            ) : subs.map((s) => (
              <tr key={s._id} style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1c1c1c')}
                onMouseLeave={e => (e.currentTarget.style.background = '#141414')}>
                <td className="py-4 px-5">
                  <div className="font-medium" style={{ color: '#f8f4ed' }}>{s.restaurantId?.name || '—'}</div>
                  <div className="text-xs" style={{ color: '#6b5040' }}>{s.restaurantId?.city}</div>
                </td>
                <td className="py-4 px-5" style={{ color: '#a89070' }}>{s.planId?.name || '—'}</td>
                <td className="py-4 px-5 font-medium" style={{ color: '#f8f4ed' }}>₹{s.amount?.toLocaleString('en-IN')}</td>
                <td className="py-4 px-5 capitalize" style={{ color: '#a89070' }}>{s.billingCycle}</td>
                <td className="py-4 px-5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={
                    s.status === 'active' ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' } :
                    s.status === 'expired' ? { background: 'rgba(239,68,68,0.1)', color: '#ef4444' } :
                    { background: 'rgba(240,192,96,0.1)', color: '#f0c060' }
                  }>{s.status}</span>
                </td>
                <td className="py-4 px-5" style={{ color: '#a89070' }}>{new Date(s.startDate).toLocaleDateString('en-IN')}</td>
                <td className="py-4 px-5" style={{ color: '#a89070' }}>{s.endDate ? new Date(s.endDate).toLocaleDateString('en-IN') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
