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
    { label: 'Active', value: stats.activeSubscriptions, icon: CheckCircle, color: 'bg-green-600' },
    { label: 'On Trial', value: stats.restaurantsOnTrial, icon: TrendingUp, color: 'bg-blue-600' },
    { label: 'Expired', value: stats.expiredSubscriptions, icon: AlertTriangle, color: 'bg-red-600' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: CreditCard, color: 'bg-amber-600' },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
