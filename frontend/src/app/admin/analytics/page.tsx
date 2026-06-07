'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  todayRevenue: number;
  pendingOrders: number;
  repeatCustomerRate?: number;
}

interface HourlyOrder {
  hour: number;
  count: number;
}

interface TopSellingItem {
  name: string;
  count: number;
  revenue: number;
}

interface RevenueData {
  daily: { date: string; revenue: number }[];
  weekly: { week: string; revenue: number }[];
}

interface CustomerData {
  total: number;
  returning: number;
  new: number;
}

// ─── Mock Data Generators ────────────────────────────────────────────────────

function generateMockDailyRevenue(): { date: string; revenue: number }[] {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    data.push({ date: label, revenue: Math.floor(3000 + Math.random() * 12000) });
  }
  return data;
}

function generateMockHourly(): HourlyOrder[] {
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count:
      h >= 11 && h <= 14
        ? Math.floor(15 + Math.random() * 20)
        : h >= 19 && h <= 22
        ? Math.floor(18 + Math.random() * 22)
        : Math.floor(Math.random() * 8),
  }));
}

function generateMockTopItems(): TopSellingItem[] {
  const names = [
    'Paneer Butter Masala',
    'Dal Makhani',
    'Chicken Biryani',
    'Naan Bread',
    'Mango Lassi',
    'Mutton Rogan Josh',
    'Veg Thali',
    'Masala Chai',
    'Gulab Jamun',
    'Chole Bhature',
  ];
  return names.map((name, i) => ({
    name,
    count: Math.floor(80 - i * 6 + Math.random() * 10),
    revenue: Math.floor((80 - i * 6 + Math.random() * 10) * (150 + Math.random() * 200)),
  }));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GOLD = '#c8972a';
const GOLD_FADED = 'rgba(200,151,42,0.35)';
const BG_CARD = '#111111';
const BG_CARD2 = '#161616';
const TEXT_PRIMARY = '#f5ede0';
const TEXT_MUTED = '#9a8468';
const BORDER = 'rgba(200,151,42,0.15)';

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function fmtNum(n: number) {
  return new Intl.NumberFormat('en-IN').format(n);
}

const tooltipStyle = {
  backgroundColor: '#141414',
  border: `1px solid ${GOLD_FADED}`,
  borderRadius: '10px',
  color: TEXT_PRIMARY,
  fontSize: 13,
};

const axisStyle = { fill: TEXT_MUTED, fontSize: 12 };

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  sub,
  trend,
  delay = 0,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  trend: 'up' | 'down' | 'neutral';
  delay?: number;
  icon: string;
}) {
  const trendColor = trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : TEXT_MUTED;
  const trendSymbol = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '─';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      style={{
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* glow dot */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,151,42,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 13, color: trendColor, fontWeight: 700, letterSpacing: 0.5 }}>
          {trendSymbol}
        </span>
      </div>
      <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </p>
      <p style={{ fontSize: 26, fontWeight: 800, color: GOLD, lineHeight: 1.1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 12, color: TEXT_MUTED }}>{sub}</p>
    </motion.div>
  );
}

function SectionHeader({ title, delay = 0 }: { title: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}
    >
      <div style={{ width: 4, height: 22, borderRadius: 2, background: `linear-gradient(180deg, ${GOLD}, #8b5a00)` }} />
      <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, margin: 0 }}>{title}</h2>
    </motion.div>
  );
}

function Card({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      style={{
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        padding: '28px 28px',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Data state
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [hourly, setHourly] = useState<HourlyOrder[]>([]);
  const [topItems, setTopItems] = useState<TopSellingItem[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [customers, setCustomers] = useState<CustomerData | null>(null);
  const [isMock, setIsMock] = useState(false);

  // UI state
  const [topItemsMode, setTopItemsMode] = useState<'orders' | 'revenue'>('orders');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    async function safe<T>(url: string): Promise<T | null> {
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    }

    const paramSuffix =
      dateRange === 'today'
        ? `?period=today`
        : dateRange === 'week'
        ? `?period=week`
        : dateRange === 'year'
        ? `?period=year`
        : `?period=month`;

    const [dash, ord, top, rev, cust] = await Promise.all([
      safe<DashboardData>(`${baseUrl}/analytics/dashboard${paramSuffix}`),
      safe<HourlyOrder[]>(`${baseUrl}/analytics/orders-per-hour${paramSuffix}`),
      safe<TopSellingItem[]>(`${baseUrl}/analytics/top-selling${paramSuffix}`),
      safe<RevenueData>(`${baseUrl}/analytics/revenue${paramSuffix}`),
      safe<CustomerData>(`${baseUrl}/analytics/repeat-customers${paramSuffix}`),
    ]);

    const useMock =
      !dash && !ord && !top && !rev && !cust;
    setIsMock(useMock);

    if (useMock) {
      const mockDaily = generateMockDailyRevenue();
      const mockHourly = generateMockHourly();
      const mockTop = generateMockTopItems();
      setDashboard({
        totalOrders: 1284,
        totalRevenue: 384520,
        avgOrderValue: 299,
        todayRevenue: 14800,
        pendingOrders: 7,
        repeatCustomerRate: 62,
      });
      setHourly(mockHourly);
      setTopItems(mockTop);
      setRevenue({ daily: mockDaily, weekly: [] });
      setCustomers({ total: 432, returning: 268, new: 164 });
    } else {
      setDashboard(dash);
      setHourly(
        (ord && ord.length > 0
          ? ord
          : generateMockHourly()) as HourlyOrder[]
      );
      setTopItems(top && top.length > 0 ? top : generateMockTopItems());
      setRevenue(
        rev && rev.daily && rev.daily.length > 0
          ? rev
          : { daily: generateMockDailyRevenue(), weekly: [] }
      );
      setCustomers(cust || { total: 0, returning: 0, new: 0 });
    }

    setLoading(false);
  }, [dateRange, token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Derived Insights ────────────────────────────────────────────────────────

  const peakHour = hourly.length
    ? hourly.reduce((a, b) => (a.count > b.count ? a : b))
    : null;

  const slowDay =
    revenue?.daily && revenue.daily.length > 0
      ? revenue.daily.reduce((a, b) => (a.revenue < b.revenue ? a : b))
      : null;

  const bestDay =
    revenue?.daily && revenue.daily.length > 0
      ? revenue.daily.reduce((a, b) => (a.revenue > b.revenue ? a : b))
      : null;

  const topItem = topItems.length > 0 ? topItems[0] : null;

  const forecastRevenue =
    revenue?.daily && revenue.daily.length >= 7
      ? Math.round(
          (revenue.daily.slice(-7).reduce((s, d) => s + d.revenue, 0) / 7) * 30
        )
      : null;

  const peakLabel =
    peakHour !== null
      ? `${peakHour.hour}:00 – ${peakHour.hour + 1}:00`
      : '—';

  const retentionRate =
    customers && customers.total > 0
      ? Math.round((customers.returning / customers.total) * 100)
      : dashboard?.repeatCustomerRate ?? 0;

  const avgOrdersPerCustomer =
    customers && customers.total > 0 && dashboard
      ? (dashboard.totalOrders / customers.total).toFixed(1)
      : '—';

  // ── Bar highlight colors ────────────────────────────────────────────────────

  const maxCount = hourly.length ? Math.max(...hourly.map((h) => h.count)) : 1;

  // ── Export ──────────────────────────────────────────────────────────────────

  function handleExport() {
    const lines = [
      '============================================',
      '        RESTRO OS — ANALYTICS REPORT',
      `        Generated: ${new Date().toLocaleString('en-IN')}`,
      '============================================',
      '',
      '── KPI SUMMARY ──',
      `Total Revenue:       ${fmt(dashboard?.totalRevenue ?? 0)}`,
      `Total Orders:        ${fmtNum(dashboard?.totalOrders ?? 0)}`,
      `Avg Order Value:     ${fmt(dashboard?.avgOrderValue ?? 0)}`,
      `Today's Revenue:     ${fmt(dashboard?.todayRevenue ?? 0)}`,
      `Pending Orders:      ${dashboard?.pendingOrders ?? 0}`,
      `Repeat Customer %:   ${retentionRate}%`,
      '',
      '── TOP 10 MENU ITEMS ──',
      ...topItems.slice(0, 10).map(
        (it, i) => `${i + 1}. ${it.name.padEnd(28)} Orders: ${it.count}  Revenue: ${fmt(it.revenue)}`
      ),
      '',
      '── CUSTOMER ANALYTICS ──',
      `Total Customers:     ${customers?.total ?? '—'}`,
      `Returning Customers: ${customers?.returning ?? '—'}`,
      `New Customers:       ${customers?.new ?? '—'}`,
      `Retention Rate:      ${retentionRate}%`,
      '',
      '── SMART INSIGHTS ──',
      `Best Day:            ${bestDay?.date ?? '—'} (${fmt(bestDay?.revenue ?? 0)})`,
      `Slowest Day:         ${slowDay?.date ?? '—'} (${fmt(slowDay?.revenue ?? 0)})`,
      `Peak Hour:           ${peakLabel}`,
      `Top Item:            ${topItem?.name ?? '—'}`,
      `Revenue Forecast:    ${forecastRevenue ? fmt(forecastRevenue) : '—'} (this month)`,
      '',
      `${isMock ? '[NOTE] Demo data shown — start taking orders for real analytics.' : ''}`,
      '============================================',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restro-analytics-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Loading Screen ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#080808',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: `3px solid ${GOLD_FADED}`,
            borderTopColor: GOLD,
          }}
        />
        <p style={{ color: TEXT_MUTED, fontSize: 14, letterSpacing: 1 }}>Loading Analytics…</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const dailyChartData = revenue?.daily ?? [];

  const pieData = [
    { name: 'Returning', value: customers?.returning ?? 0 },
    { name: 'New', value: customers?.new ?? 0 },
  ];
  const PIE_COLORS = [GOLD, GOLD_FADED];

  const sortedTopItems = [...topItems].sort((a, b) =>
    topItemsMode === 'revenue' ? b.revenue - a.revenue : b.count - a.count
  );

  return (
    <div
      style={{
        background: '#080808',
        minHeight: '100vh',
        padding: '32px 28px 60px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: TEXT_PRIMARY,
      }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}
      >
        <div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              margin: 0,
              background: `linear-gradient(135deg, ${GOLD}, #f0c060, #8b5a00)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Analytics
          </h1>
          <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
            Enterprise dashboard · Restro OS
            {isMock && (
              <span
                style={{
                  marginLeft: 10,
                  background: 'rgba(200,151,42,0.12)',
                  border: `1px solid ${GOLD_FADED}`,
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 11,
                  color: GOLD,
                  letterSpacing: 0.5,
                }}
              >
                Demo Data
              </span>
            )}
          </p>
        </div>

        {/* Date Range Selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['today', 'week', 'month', 'year'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: `1px solid ${dateRange === r ? GOLD : BORDER}`,
                background: dateRange === r ? `rgba(200,151,42,0.15)` : 'transparent',
                color: dateRange === r ? GOLD : TEXT_MUTED,
                fontSize: 13,
                fontWeight: dateRange === r ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          style={{
            padding: '10px 22px',
            borderRadius: 10,
            border: `1px solid ${GOLD}`,
            background: `linear-gradient(135deg, rgba(200,151,42,0.18), rgba(200,151,42,0.06))`,
            color: GOLD,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          ⬇ Download Report
        </button>
      </motion.div>

      {/* ━━━ KPI CARDS ━━━ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}
      >
        <KpiCard
          title="Total Revenue"
          value={fmt(dashboard?.totalRevenue ?? 0)}
          sub={`${fmtNum(dashboard?.totalOrders ?? 0)} orders total`}
          trend="up"
          delay={0}
          icon="💰"
        />
        <KpiCard
          title="Total Orders"
          value={fmtNum(dashboard?.totalOrders ?? 0)}
          sub="Across all channels"
          trend="up"
          delay={0.05}
          icon="🛒"
        />
        <KpiCard
          title="Avg Order Value"
          value={fmt(dashboard?.avgOrderValue ?? 0)}
          sub="Per transaction"
          trend="neutral"
          delay={0.1}
          icon="📊"
        />
        <KpiCard
          title="Repeat Customer %"
          value={`${retentionRate}%`}
          sub={`${customers?.returning ?? '—'} returning customers`}
          trend={retentionRate >= 50 ? 'up' : 'down'}
          delay={0.15}
          icon="🔁"
        />
        <KpiCard
          title="Today's Revenue"
          value={fmt(dashboard?.todayRevenue ?? 0)}
          sub="Collected today"
          trend="up"
          delay={0.2}
          icon="📅"
        />
        <KpiCard
          title="Pending Orders"
          value={String(dashboard?.pendingOrders ?? 0)}
          sub="Awaiting processing"
          trend={(dashboard?.pendingOrders ?? 0) > 10 ? 'down' : 'neutral'}
          delay={0.25}
          icon="⏳"
        />
      </div>

      {/* ━━━ SECTION 1: Revenue Trend ━━━ */}
      <Card delay={0.3} style={{ marginBottom: 32 }}>
        <SectionHeader title="Revenue Trend — Last 30 Days" />
        {dailyChartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: TEXT_MUTED, fontSize: 14 }}>
            No data yet — start taking orders
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,151,42,0.07)" />
              <XAxis
                dataKey="date"
                tick={axisStyle}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={axisStyle}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [`${fmt(Number(v))}`, 'Revenue']}
                labelStyle={{ color: GOLD, fontWeight: 700 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={GOLD}
                strokeWidth={2.5}
                fill="url(#goldGrad)"
                dot={false}
                activeDot={{ r: 5, fill: GOLD, stroke: '#080808', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ━━━ SECTION 2: Peak Hours ━━━ */}
      <Card delay={0.35} style={{ marginBottom: 32 }}>
        <SectionHeader title="Peak Hours Analysis" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={hourly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,151,42,0.07)" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={(h: number) => `${h}h`}
            />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${v}`, 'Orders']}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(l: any) => `Hour: ${l}:00`}
              labelStyle={{ color: GOLD }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {hourly.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.count === maxCount ? GOLD : GOLD_FADED}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* AI Insight */}
        <div
          style={{
            marginTop: 20,
            background: 'rgba(200,151,42,0.07)',
            border: `1px solid ${GOLD_FADED}`,
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>🤖</span>
          <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}>
            <span style={{ color: GOLD, fontWeight: 700 }}>AI Insight: </span>
            Peak hours are <span style={{ color: TEXT_PRIMARY }}>12pm–2pm</span> and{' '}
            <span style={{ color: TEXT_PRIMARY }}>7pm–9pm</span>. Consider adding extra staff during
            these windows. The busiest single hour is{' '}
            <span style={{ color: TEXT_PRIMARY }}>{peakLabel}</span> with{' '}
            <span style={{ color: GOLD, fontWeight: 700 }}>{peakHour?.count ?? '—'} orders</span>.
          </p>
        </div>
      </Card>

      {/* ━━━ SECTION 3: Top Selling Items ━━━ */}
      <Card delay={0.4} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <SectionHeader title="Menu Performance — Top 10 Items" />
          <div style={{ display: 'flex', gap: 8 }}>
            {(['orders', 'revenue'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTopItemsMode(mode)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  border: `1px solid ${topItemsMode === mode ? GOLD : BORDER}`,
                  background: topItemsMode === mode ? `rgba(200,151,42,0.15)` : 'transparent',
                  color: topItemsMode === mode ? GOLD : TEXT_MUTED,
                  fontSize: 12,
                  fontWeight: topItemsMode === mode ? 700 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                By {mode === 'orders' ? 'Orders' : 'Revenue'}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={sortedTopItems.slice(0, 10)}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,151,42,0.07)" horizontal={false} />
            <XAxis
              type="number"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              tickFormatter={topItemsMode === 'revenue' ? (v: number) => `₹${(v / 1000).toFixed(0)}k` : undefined}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ ...axisStyle, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={140}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) =>
                topItemsMode === 'revenue'
                  ? [fmt(Number(v)), 'Revenue']
                  : [`${v}`, 'Orders']
              }
              labelStyle={{ color: GOLD }}
            />
            <Bar
              dataKey={topItemsMode === 'revenue' ? 'revenue' : 'count'}
              radius={[0, 4, 4, 0]}
            >
              {sortedTopItems.slice(0, 10).map((_, i) => (
                <Cell
                  key={`item-${i}`}
                  fill={i === 0 ? GOLD : i === 1 ? 'rgba(200,151,42,0.7)' : i === 2 ? 'rgba(200,151,42,0.5)' : GOLD_FADED}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Rank badges */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {sortedTopItems.slice(0, 3).map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(200,151,42,0.08)',
                border: `1px solid ${GOLD_FADED}`,
                borderRadius: 8,
                padding: '6px 14px',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background:
                    i === 0
                      ? 'linear-gradient(135deg,#8b5a00,#f0c060)'
                      : i === 1
                      ? 'linear-gradient(135deg,#6b7280,#d1d5db)'
                      : 'linear-gradient(135deg,#92400e,#d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#080808',
                }}
              >
                #{i + 1}
              </span>
              <span style={{ fontSize: 12, color: TEXT_PRIMARY, fontWeight: 600 }}>{item.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ━━━ SECTION 4: Customer Analytics ━━━ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Pie chart */}
        <Card delay={0.45}>
          <SectionHeader title="Customer Split" />
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: GOLD_FADED }}
              >
                {pieData.map((_, i) => (
                  <Cell key={`pie-${i}`} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
            {pieData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i] }} />
                <span style={{ fontSize: 12, color: TEXT_MUTED }}>{d.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Stat cards */}
        <Card delay={0.5}>
          <SectionHeader title="Customer Stats" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Total Unique Customers', value: fmtNum(customers?.total ?? 0) },
              { label: 'Avg Orders per Customer', value: avgOrdersPerCustomer },
              { label: 'Customer Retention Rate', value: `${retentionRate}%` },
              { label: 'Most Loyal (Top Item)', value: topItem?.name ?? '—' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: BG_CARD2,
                  borderRadius: 10,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <span style={{ fontSize: 13, color: TEXT_MUTED }}>{stat.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ━━━ SECTION 5: AI Smart Insights ━━━ */}
      <Card delay={0.55} style={{ marginBottom: 32 }}>
        <SectionHeader title="🤖 Smart Insights" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[
            {
              label: 'Best Performing Day',
              value: bestDay
                ? `${bestDay.date} · ${fmt(bestDay.revenue)}`
                : 'Insufficient data',
              border: '#4ade80',
              icon: '📈',
            },
            {
              label: 'Slowest Day',
              value: slowDay
                ? `${slowDay.date} · ${fmt(slowDay.revenue)}`
                : 'Insufficient data',
              border: '#facc15',
              icon: '📉',
            },
            {
              label: 'Most Popular Item',
              value: topItem ? `${topItem.name} (${topItem.count} orders)` : '—',
              border: GOLD,
              icon: '🏆',
            },
            {
              label: 'Revenue Forecast (Month)',
              value: forecastRevenue ? fmt(forecastRevenue) : 'Need more data',
              border: '#60a5fa',
              icon: '🔮',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.07 }}
              style={{
                background: BG_CARD2,
                borderRadius: 12,
                padding: '18px 20px',
                borderLeft: `4px solid ${card.border}`,
                border: `1px solid ${BORDER}`,
                borderLeftColor: card.border,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{card.icon}</span>
                <span style={{ fontSize: 12, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {card.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT_PRIMARY }}>{card.value}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* ━━━ No data note ━━━ */}
      <AnimatePresence>
        {isMock && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: 'center',
              padding: '18px',
              background: 'rgba(200,151,42,0.06)',
              border: `1px dashed ${GOLD_FADED}`,
              borderRadius: 12,
              fontSize: 13,
              color: TEXT_MUTED,
            }}
          >
            ⚡ No real data yet — this is a demo preview. Start taking orders to see live analytics.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
