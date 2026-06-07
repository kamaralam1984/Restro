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
    <div style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.3)', borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', fontSize: 12 }}>
      <p style={{ color: '#a89070', marginBottom: 4, fontWeight: 500 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name.toLowerCase().includes('revenue') ? `₹${Number(p.value).toLocaleString('en-IN')}` : p.value}
        </p>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#c8972a', '#f0c060', '#22c55e', '#60a5fa', '#a89070'];

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, iconBg, delay }: {
  icon: any; label: string; value: string | number; sub: string; iconBg: string; delay: number;
}) {
  return (
    <motion.div
      className="rounded-xl p-5 flex items-center gap-4"
      style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon className="w-6 h-6" style={{ color: '#080808' }} />
      </div>
      <div>
        <div style={{ color: '#a89070', fontSize: 12 }} className="mb-0.5">{label}</div>
        <div style={{ color: '#f8f4ed', fontSize: 24, fontWeight: 700 }}>{value}</div>
        <div style={{ color: '#6b5040', fontSize: 12 }} className="mt-0.5">{sub}</div>
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
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#f8f4ed' }}>
            <BarChart3 className="w-6 h-6" style={{ color: '#c8972a' }} />
            Business Analytics
          </h1>
          <p style={{ color: '#a89070', fontSize: 14 }} className="mt-1">Platform-wide revenue, orders & sales insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex rounded-lg p-1 gap-1" style={{ background: '#1c1c1c' }}>
            {[7, 14, 30, 90].map(d => (
              <button key={d}
                onClick={() => setPeriod(d)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                style={period === d ? {
                  background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                  color: '#080808',
                  border: 'none',
                } : {
                  color: '#a89070',
                  background: 'transparent',
                  border: 'none',
                }}
              >
                {d}d
              </button>
            ))}
          </div>
          <button onClick={() => load(period)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)', color: '#a89070' }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: '#c8972a' }} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Total Revenue" delay={0}
          value={`₹${(totals?.totalRevenue || 0).toLocaleString('en-IN')}`}
          sub={`Last ${period} days`} iconBg="linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)" />
        <StatCard icon={Wifi} label="Online Revenue" delay={0.05}
          value={`₹${(totals?.onlineRevenue || 0).toLocaleString('en-IN')}`}
          sub={`${onlinePct}% of total`} iconBg="rgba(96,165,250,0.25)" />
        <StatCard icon={ShoppingBag} label="Total Orders" delay={0.1}
          value={(totals?.totalOrders || 0).toLocaleString('en-IN')}
          sub={`${totals?.onlineOrders || 0} online`} iconBg="rgba(240,192,96,0.2)" />
        <StatCard icon={Store} label="Active Restaurants" delay={0.15}
          value={data?.totalRestaurants || 0}
          sub="on platform" iconBg="rgba(34,197,94,0.2)" />
      </div>

      {/* Revenue Trend Area Chart */}
      <motion.div className="rounded-2xl p-6"
        style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 style={{ color: '#f8f4ed' }} className="font-semibold">Revenue Trend</h2>
            <p style={{ color: '#a89070', fontSize: 12 }} className="mt-0.5">Daily total vs online revenue over {period} days</p>
          </div>
          <TrendingUp className="w-5 h-5" style={{ color: '#c8972a' }} />
        </div>
        {filledTrend.length === 0 || filledTrend.every(d => d.revenue === 0) ? (
          <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#6b5040' }}>
            No revenue data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={filledTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c8972a" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#c8972a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOnline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,151,42,0.08)" />
              <XAxis dataKey="date" tick={{ fill: '#6b5040', fontSize: 11 }} tickLine={false} axisLine={false}
                interval={Math.floor(filledTrend.length / 6)} />
              <YAxis tick={{ fill: '#6b5040', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ color: '#a89070', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#c8972a"
                fill="url(#gradTotal)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="onlineRevenue" name="Online Revenue" stroke="#60a5fa"
                fill="url(#gradOnline)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Per-restaurant bar + pie row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Bar chart */}
        <motion.div className="xl:col-span-2 rounded-2xl p-6"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 style={{ color: '#f8f4ed' }} className="font-semibold">Revenue by Restaurant</h2>
              <p style={{ color: '#a89070', fontSize: 12 }} className="mt-0.5">Online vs Offline breakdown</p>
            </div>
          </div>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#6b5040' }}>
              No order data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,151,42,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#6b5040', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b5040', fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ color: '#a89070', fontSize: 12 }} />
                <Bar dataKey="Online Revenue" fill="#c8972a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Offline Revenue" fill="#f0c060" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie charts */}
        <motion.div className="rounded-2xl p-6 flex flex-col gap-6"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div>
            <h2 style={{ color: '#f8f4ed' }} className="font-semibold mb-1">Revenue Split</h2>
            <p style={{ color: '#a89070', fontSize: 12 }}>Online vs Offline</p>
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
              <Legend wrapperStyle={{ color: '#a89070', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pt-4" style={{ borderTop: '1px solid rgba(200,151,42,0.13)' }}>
            <p style={{ color: '#a89070', fontSize: 12 }} className="mb-3">Orders Split</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={orderPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                  paddingAngle={3} dataKey="value">
                  {orderPieData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#60a5fa' : '#f0c060'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ color: '#a89070', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Per-restaurant leaderboard table */}
      <motion.div className="rounded-2xl p-6"
        style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 style={{ color: '#f8f4ed' }} className="font-semibold mb-4">Restaurant Sales Leaderboard</h2>
        {data?.perRestaurant.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: '#6b5040' }}>
            No sales data for this period. Once orders are placed, rankings will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ background: '#1c1c1c', borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                  <th className="pb-3 px-2" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>#</th>
                  <th className="pb-3 px-2" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Restaurant</th>
                  <th className="pb-3 px-2" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>City</th>
                  <th className="pb-3 px-2 text-right" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Orders</th>
                  <th className="pb-3 px-2 text-right" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Online Orders</th>
                  <th className="pb-3 px-2 text-right" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Revenue</th>
                  <th className="pb-3 px-2 text-right" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Online Revenue</th>
                  <th className="pb-3 px-2 text-right" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Online%</th>
                </tr>
              </thead>
              <tbody>
                {data?.perRestaurant.map((r, idx) => {
                  const pct = r.totalRevenue ? Math.round((r.onlineRevenue / r.totalRevenue) * 100) : 0;
                  return (
                    <tr key={r._id}
                      className="transition-colors"
                      style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1c1c1c')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#141414')}
                    >
                      <td className="py-3 px-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={
                            idx === 0 ? { background: '#f0c060', color: '#080808' } :
                            idx === 1 ? { background: '#a89070', color: '#080808' } :
                            idx === 2 ? { background: '#8b5a00', color: '#f8f4ed' } :
                            { background: '#1c1c1c', color: '#6b5040' }
                          }
                        >{idx + 1}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div style={{ color: '#f8f4ed' }} className="font-medium">{r.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: r.status === 'active' ? '#22c55e' : '#ef4444' }}>
                          {r.status}
                        </div>
                      </td>
                      <td className="py-3 px-2" style={{ color: '#a89070' }}>{r.city || '—'}</td>
                      <td className="py-3 px-2 text-right font-medium" style={{ color: '#f8f4ed' }}>{r.totalOrders}</td>
                      <td className="py-3 px-2 text-right">
                        <span className="flex items-center justify-end gap-1" style={{ color: '#60a5fa' }}>
                          <Wifi className="w-3 h-3" /> {r.onlineOrders}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold" style={{ color: '#22c55e' }}>
                        ₹{r.totalRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold" style={{ color: '#c8972a' }}>
                        ₹{r.onlineRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: '#1c1c1c' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#c8972a' }} />
                          </div>
                          <span style={{ color: '#a89070', fontSize: 12 }}>{pct}%</span>
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
