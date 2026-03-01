'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, IndianRupee, ShoppingBag, Store,
  Wifi, WifiOff, RefreshCw, BarChart3,
} from 'lucide-react';
import api from '@/services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Totals {
  totalOrders: number;
  totalRevenue: number;
  onlineRevenue: number;
  onlineOrders: number;
}

interface RestaurantStat {
  _id: string;
  name: string;
  city: string;
  status: string;
  totalOrders: number;
  totalRevenue: number;
  onlineOrders: number;
  onlineRevenue: number;
}

interface DayTrend {
  date: string;
  revenue: number;
  orders: number;
  onlineRevenue: number;
}

interface Analytics {
  period: number;
  totals: Totals;
  totalRestaurants: number;
  perRestaurant: RestaurantStat[];
  dailyTrend: DayTrend[];
}

// ── Recharts custom tooltip ────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.name.toLowerCase().includes('revenue') ? `₹${Number(p.value).toLocaleString('en-IN')}` : p.value}
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#7c3aed', '#ea580c', '#16a34a', '#0284c7', '#ca8a04'];

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color, delay }: {
  icon: any; label: string; value: string | number; sub: string; color: string; delay: number;
}) {
  return (
    <motion.div
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-slate-400 text-xs mb-0.5">{label}</div>
        <div className="text-white text-2xl font-bold">{value}</div>
        <div className="text-slate-500 text-xs mt-0.5">{sub}</div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MasterAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  const headers = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  const load = useCallback(async (days: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/super-admin/analytics?days=${days}`, { headers: headers() });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { load(period); }, [period, load]);

  // fill missing dates in trend
  const filledTrend = (() => {
    if (!data?.dailyTrend.length) return [];
    const map: Record<string, DayTrend> = {};
    data.dailyTrend.forEach(d => { map[d.date] = d; });
    const result: DayTrend[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push(map[key] || { date: key, revenue: 0, orders: 0, onlineRevenue: 0 });
    }
    return result.map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      offlineRevenue: d.revenue - d.onlineRevenue,
    }));
  })();

  // Per-restaurant bar data
  const barData = data?.perRestaurant.slice(0, 10).map(r => ({
    name: r.name.length > 14 ? r.name.slice(0, 14) + '…' : r.name,
    'Total Revenue': r.totalRevenue,
    'Online Revenue': r.onlineRevenue,
    'Offline Revenue': r.totalRevenue - r.onlineRevenue,
  })) || [];

  // Pie: online vs offline revenue
  const totals = data?.totals;
  const offlineRevenue = (totals?.totalRevenue || 0) - (totals?.onlineRevenue || 0);
  const pieData = [
    { name: 'Online Revenue', value: totals?.onlineRevenue || 0 },
    { name: 'Offline/Cash', value: offlineRevenue },
  ];
  const orderPieData = [
    { name: 'Online Orders', value: totals?.onlineOrders || 0 },
    { name: 'Offline Orders', value: (totals?.totalOrders || 0) - (totals?.onlineOrders || 0) },
  ];

  const onlinePct = totals?.totalRevenue
    ? Math.round(((totals.onlineRevenue || 0) / totals.totalRevenue) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            Business Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">Platform-wide revenue, orders & sales insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
            {[7, 14, 30, 90].map(d => (
              <button key={d}
                onClick={() => setPeriod(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  period === d ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button onClick={() => load(period)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Total Revenue" delay={0}
          value={`₹${(totals?.totalRevenue || 0).toLocaleString('en-IN')}`}
          sub={`Last ${period} days`} color="bg-amber-600" />
        <StatCard icon={Wifi} label="Online Revenue" delay={0.05}
          value={`₹${(totals?.onlineRevenue || 0).toLocaleString('en-IN')}`}
          sub={`${onlinePct}% of total`} color="bg-blue-600" />
        <StatCard icon={ShoppingBag} label="Total Orders" delay={0.1}
          value={(totals?.totalOrders || 0).toLocaleString('en-IN')}
          sub={`${totals?.onlineOrders || 0} online`} color="bg-orange-600" />
        <StatCard icon={Store} label="Active Restaurants" delay={0.15}
          value={data?.totalRestaurants || 0}
          sub="on platform" color="bg-green-600" />
      </div>

      {/* Revenue Trend Area Chart */}
      <motion.div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold">Revenue Trend</h2>
            <p className="text-slate-400 text-xs mt-0.5">Daily total vs online revenue over {period} days</p>
          </div>
          <TrendingUp className="w-5 h-5 text-amber-400" />
        </div>
        {filledTrend.length === 0 || filledTrend.every(d => d.revenue === 0) ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
            No revenue data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={filledTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOnline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false}
                interval={Math.floor(filledTrend.length / 6)} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#7c3aed"
                fill="url(#gradTotal)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="onlineRevenue" name="Online Revenue" stroke="#2563eb"
                fill="url(#gradOnline)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Per-restaurant bar + pie row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Bar chart */}
        <motion.div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-semibold">Revenue by Restaurant</h2>
              <p className="text-slate-400 text-xs mt-0.5">Online vs Offline breakdown</p>
            </div>
          </div>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              No order data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Bar dataKey="Online Revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Offline Revenue" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie charts */}
        <motion.div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div>
            <h2 className="text-white font-semibold mb-1">Revenue Split</h2>
            <p className="text-slate-400 text-xs">Online vs Offline</p>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="border-t border-slate-800 pt-4">
            <p className="text-slate-400 text-xs mb-3">Orders Split</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={orderPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                  paddingAngle={3} dataKey="value">
                  {orderPieData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#0284c7' : '#ea580c'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Per-restaurant leaderboard table */}
      <motion.div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 className="text-white font-semibold mb-4">Restaurant Sales Leaderboard</h2>
        {data?.perRestaurant.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No sales data for this period. Once orders are placed, rankings will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-left">
                  <th className="pb-3 px-2">#</th>
                  <th className="pb-3 px-2">Restaurant</th>
                  <th className="pb-3 px-2">City</th>
                  <th className="pb-3 px-2 text-right">Total Orders</th>
                  <th className="pb-3 px-2 text-right">Online Orders</th>
                  <th className="pb-3 px-2 text-right">Total Revenue</th>
                  <th className="pb-3 px-2 text-right">Online Revenue</th>
                  <th className="pb-3 px-2 text-right">Online%</th>
                </tr>
              </thead>
              <tbody>
                {data?.perRestaurant.map((r, idx) => {
                  const pct = r.totalRevenue ? Math.round((r.onlineRevenue / r.totalRevenue) * 100) : 0;
                  return (
                    <tr key={r._id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-yellow-500 text-black' :
                          idx === 1 ? 'bg-slate-400 text-black' :
                          idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>{idx + 1}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-white font-medium">{r.name}</div>
                        <div className={`text-xs mt-0.5 ${r.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                          {r.status}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-400">{r.city || '—'}</td>
                      <td className="py-3 px-2 text-right text-white font-medium">{r.totalOrders}</td>
                      <td className="py-3 px-2 text-right">
                        <span className="flex items-center justify-end gap-1 text-blue-400">
                          <Wifi className="w-3 h-3" /> {r.onlineOrders}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-green-400 font-semibold">
                        ₹{r.totalRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-2 text-right text-amber-400 font-semibold">
                        ₹{r.onlineRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-slate-400 text-xs">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
