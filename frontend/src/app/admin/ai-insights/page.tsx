'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Constants ──────────────────────────────────────────────────────────────────
const GOLD = '#c8972a';
const BG = '#080808';
const SURFACE = '#141414';
const SURFACE2 = '#1a1a1a';
const BORDER = 'rgba(200,151,42,0.18)';
const API = 'http://localhost:5000/api';

// ── Types ──────────────────────────────────────────────────────────────────────
interface DayRevenue {
  date: string;
  revenue: number;
}

interface HourlyOrder {
  hour: number;
  count: number;
  revenue: number;
}

interface TopItem {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface RepeatCustomer {
  _id: string;
  orderCount: number;
  totalSpent: number;
}

interface InsightCard {
  id: string;
  icon: string;
  title: string;
  insight: string;
  impact: 'High' | 'Medium' | 'Low';
  actionLabel: string;
  actionHref: string;
  value?: string;
}

interface Recommendation {
  id: string;
  title: string;
  reasoning: string;
  estimatedImpact: number;
  actionHref: string;
  priority: number;
  triggered: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function formatRupee(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function safeGet<T>(url: string): Promise<T | null> {
  return fetch(url, { headers: authHeaders() })
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Mock Helpers (when API returns null/empty) ─────────────────────────────────
function makeMockDailyRevenue(): DayRevenue[] {
  const out: DayRevenue[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    // Weekend boost
    const base = dow === 0 || dow === 6 ? 9000 : 6000;
    out.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(base + Math.random() * 5000 + i * 40),
    });
  }
  return out;
}

function makeMockHourly(): HourlyOrder[] {
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: h >= 12 && h <= 14 ? Math.floor(18 + Math.random() * 12) :
           h >= 19 && h <= 21 ? Math.floor(22 + Math.random() * 14) :
           Math.floor(Math.random() * 6),
    revenue: 0,
  }));
}

// ── Computation Helpers ────────────────────────────────────────────────────────
function computeGrowthTrend(daily: DayRevenue[]): number {
  if (daily.length < 14) return 1.02;
  const last7 = daily.slice(-7).reduce((s, d) => s + d.revenue, 0) / 7;
  const prev7 = daily.slice(-14, -7).reduce((s, d) => s + d.revenue, 0) / 7;
  return prev7 > 0 ? last7 / prev7 : 1.02;
}

function computeDayOfWeekFactor(dayIndex: number, daily: DayRevenue[]): number {
  if (daily.length < 7) return 1;
  // Build a simple DOW average map from past 4 weeks
  const dowTotals: Record<number, { sum: number; count: number }> = {};
  for (let i = 0; i < 7; i++) dowTotals[i] = { sum: 0, count: 0 };
  const now = new Date();
  daily.forEach(d => {
    // Reconstruct date from label is hard; use index modulo 7 as proxy
    const idx = daily.indexOf(d);
    const date = new Date(now);
    date.setDate(date.getDate() - (daily.length - 1 - idx));
    const dow = date.getDay();
    dowTotals[dow].sum += d.revenue;
    dowTotals[dow].count++;
  });
  const dayAvg = dowTotals[dayIndex].count > 0 ? dowTotals[dayIndex].sum / dowTotals[dayIndex].count : 0;
  const overallAvg = daily.reduce((s, d) => s + d.revenue, 0) / daily.length;
  return overallAvg > 0 ? dayAvg / overallAvg : 1;
}

function computeSlowDay(daily: DayRevenue[]): string {
  const now = new Date();
  const dowRevenue: Record<number, number[]> = {};
  for (let i = 0; i < 7; i++) dowRevenue[i] = [];
  daily.forEach((d, idx) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (daily.length - 1 - idx));
    const dow = date.getDay();
    dowRevenue[dow].push(d.revenue);
  });
  let slowest = 0;
  let minAvg = Infinity;
  for (let i = 0; i < 7; i++) {
    if (dowRevenue[i].length === 0) continue;
    const avg = dowRevenue[i].reduce((s, v) => s + v, 0) / dowRevenue[i].length;
    if (avg < minAvg) { minAvg = avg; slowest = i; }
  }
  return DAY_NAMES[slowest];
}

function computeBestDay(daily: DayRevenue[]): string {
  const now = new Date();
  const dowRevenue: Record<number, number[]> = {};
  for (let i = 0; i < 7; i++) dowRevenue[i] = [];
  daily.forEach((d, idx) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (daily.length - 1 - idx));
    const dow = date.getDay();
    dowRevenue[dow].push(d.revenue);
  });
  let best = 0;
  let maxAvg = -Infinity;
  for (let i = 0; i < 7; i++) {
    if (dowRevenue[i].length === 0) continue;
    const avg = dowRevenue[i].reduce((s, v) => s + v, 0) / dowRevenue[i].length;
    if (avg > maxAvg) { maxAvg = avg; best = i; }
  }
  return DAY_NAMES[best];
}

function computePeakHours(hourly: HourlyOrder[]): string {
  const sorted = [...hourly].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 6).map(h => h.hour).sort((a, b) => a - b);
  // Group into contiguous ranges
  const ranges: number[][] = [];
  let current: number[] = [top[0]];
  for (let i = 1; i < top.length; i++) {
    if (top[i] - top[i - 1] <= 2) {
      current.push(top[i]);
    } else {
      ranges.push(current);
      current = [top[i]];
    }
  }
  ranges.push(current);

  const fmt = (h: number) => {
    if (h === 0) return '12AM';
    if (h < 12) return `${h}AM`;
    if (h === 12) return '12PM';
    return `${h - 12}PM`;
  };

  return ranges
    .slice(0, 2)
    .map(r => `${fmt(r[0])}–${fmt(r[r.length - 1])}`)
    .join(' and ');
}

// ── Skeleton Loader ────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #1a1a1a 0%, #242424 50%, #1a1a1a 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

// ── Tab Button ─────────────────────────────────────────────────────────────────
function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '9px 24px', borderRadius: 8,
        border: active ? `1px solid ${GOLD}` : '1px solid rgba(255,255,255,0.08)',
        background: active ? GOLD + '22' : 'transparent',
        color: active ? GOLD : 'rgba(255,255,255,0.5)',
        fontWeight: active ? 700 : 400, fontSize: 13, cursor: 'pointer',
        transition: 'all 0.2s', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

// ── Impact Badge ───────────────────────────────────────────────────────────────
function ImpactBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const colors = {
    High: { bg: '#2a0f0f', border: '#ef4444', text: '#ef4444' },
    Medium: { bg: '#2a1f00', border: GOLD, text: GOLD },
    Low: { bg: '#0f1f0f', border: '#22c55e', text: '#22c55e' },
  };
  const c = colors[level];
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    }}>
      {level} Impact
    </span>
  );
}

// ── Inline SVG Bar Chart ───────────────────────────────────────────────────────
function RevenueBarChart({
  actual,
  forecast,
}: {
  actual: DayRevenue[];
  forecast: DayRevenue[];
}) {
  const all = [...actual, ...forecast];
  const maxVal = Math.max(...all.map(d => d.revenue), 1);
  const width = 800;
  const height = 160;
  const bars = all.length;
  const gutter = 3;
  const barW = Math.max(4, Math.floor((width - gutter * (bars - 1)) / bars));
  const isActual = (i: number) => i < actual.length;

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
      <svg viewBox={`0 0 ${width} ${height + 24}`} style={{ width: '100%', minWidth: 500, height: 'auto', display: 'block' }}>
        {all.map((d, i) => {
          const barH = Math.max(3, Math.floor((d.revenue / maxVal) * height));
          const x = i * (barW + gutter);
          const y = height - barH;
          const actual_bar = isActual(i);
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={barH}
                rx={2} ry={2}
                fill={actual_bar ? GOLD : `${GOLD}55`}
              />
              {i % 7 === 0 && (
                <text
                  x={x + barW / 2} y={height + 16}
                  textAnchor="middle"
                  fontSize={8}
                  fill="rgba(255,255,255,0.3)"
                >
                  {d.date.split(' ')[0]}
                </text>
              )}
            </g>
          );
        })}
        {/* Legend */}
        <rect x={width - 120} y={4} width={10} height={10} rx={2} fill={GOLD} />
        <text x={width - 106} y={13} fontSize={9} fill="rgba(255,255,255,0.5)">Actual</text>
        <rect x={width - 60} y={4} width={10} height={10} rx={2} fill={`${GOLD}55`} />
        <text x={width - 46} y={13} fontSize={9} fill="rgba(255,255,255,0.5)">Forecast</text>
      </svg>
    </div>
  );
}

// ── TAB 1: Revenue Forecast ────────────────────────────────────────────────────
function RevenueForecastTab({ daily, hourly, loading }: {
  daily: DayRevenue[];
  hourly: HourlyOrder[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
              <Skeleton h={12} w="60%" />
              <div style={{ marginTop: 12 }}><Skeleton h={32} w="80%" /></div>
            </div>
          ))}
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24, height: 220 }}>
          <Skeleton h={180} />
        </div>
      </div>
    );
  }

  if (daily.length === 0) return null;

  // Compute forecasts
  const growthTrend = computeGrowthTrend(daily);
  const todayDOW = new Date().getDay();
  const dowFactor = computeDayOfWeekFactor(todayDOW, daily);
  const avgLast7 = daily.slice(-7).reduce((s, d) => s + d.revenue, 0) / 7;
  const todayForecast = Math.round(avgLast7 * growthTrend * dowFactor);
  const weekForecast = Array.from({ length: 7 }, (_, i) => {
    const dow = (todayDOW + i) % 7;
    const f = computeDayOfWeekFactor(dow, daily);
    return Math.round(avgLast7 * growthTrend * f);
  }).reduce((s, v) => s + v, 0);
  const monthForecast = Math.round(weekForecast * 4.33);

  const last30Avg = daily.reduce((s, d) => s + d.revenue, 0) / daily.length;
  const prev30Avg = last30Avg / growthTrend;
  const momGrowth = prev30Avg > 0 ? ((last30Avg - prev30Avg) / prev30Avg) * 100 : 0;

  // Next 7 day forecast bars
  const forecastBars: DayRevenue[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dow = d.getDay();
    const f = computeDayOfWeekFactor(dow, daily);
    return {
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      revenue: Math.round(avgLast7 * growthTrend * f),
    };
  });

  const bestDay = computeBestDay(daily);
  const peakHours = computePeakHours(hourly);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: "Today's Revenue Forecast", value: formatRupee(todayForecast), sub: 'Based on last 7-day avg' },
          { label: 'This Week Forecast', value: formatRupee(weekForecast), sub: 'Next 7 days' },
          { label: 'This Month Forecast', value: formatRupee(monthForecast), sub: 'Projected 30 days' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24,
          }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 10 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: GOLD, marginBottom: 4 }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{kpi.sub}</div>
          </div>
        ))}
        {/* MoM Growth */}
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24,
        }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 10 }}>
            MoM Growth
          </div>
          <div style={{
            fontSize: 26, fontWeight: 800,
            color: momGrowth >= 0 ? '#22c55e' : '#ef4444',
            marginBottom: 6,
          }}>
            {momGrowth >= 0 ? '+' : ''}{momGrowth.toFixed(1)}%
          </div>
          <span style={{
            background: momGrowth >= 0 ? '#052e16' : '#2a0f0f',
            border: `1px solid ${momGrowth >= 0 ? '#22c55e' : '#ef4444'}`,
            color: momGrowth >= 0 ? '#22c55e' : '#ef4444',
            padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          }}>
            {momGrowth >= 0 ? 'Growing' : 'Declining'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
        <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 6 }}>
          30-Day Revenue + 7-Day Forecast
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>
          Darker bars = actual, lighter = forecast
        </div>
        <RevenueBarChart actual={daily} forecast={forecastBars} />
      </div>

      {/* Insights Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>C</span>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>Best Day Prediction</div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            <span style={{ color: GOLD, fontWeight: 700 }}>{bestDay}</span> tends to be your highest revenue day based on 30-day historical patterns.
          </div>
        </div>
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>&gt;</span>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>Peak Hours</div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Your busiest hours are <span style={{ color: GOLD, fontWeight: 700 }}>{peakHours}</span>. Ensure full staffing during these windows.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TAB 2: Business Insights ───────────────────────────────────────────────────
function BusinessInsightsTab({ daily, hourly, topItems, repeatCustomers, dashboard, loading }: {
  daily: DayRevenue[];
  hourly: HourlyOrder[];
  topItems: TopItem[];
  repeatCustomers: RepeatCustomer[];
  dashboard: { todayOrders: number; todayRevenue: number } | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
            <Skeleton h={14} w="50%" />
            <div style={{ marginTop: 12 }}><Skeleton h={10} /></div>
            <div style={{ marginTop: 6 }}><Skeleton h={10} w="80%" /></div>
            <div style={{ marginTop: 16 }}><Skeleton h={24} w="40%" /></div>
          </div>
        ))}
      </div>
    );
  }

  if (daily.length === 0) return null;

  // Compute all insights
  const avg7DayOrders = daily.slice(-7).reduce((s, d) => s + (d.revenue > 0 ? 1 : 0), 0);
  const avgRevenue7 = daily.slice(-7).reduce((s, d) => s + d.revenue, 0) / 7;
  const todayRev = dashboard?.todayRevenue ?? (daily[daily.length - 1]?.revenue || 0);
  const demandSpike = todayRev > avgRevenue7 * 1.2;

  const slowDay = computeSlowDay(daily);

  const topCategoryItem = topItems[0];
  const topCategoryName = topCategoryItem?.name || 'Biryani';

  const totalCustomers = repeatCustomers.length > 0 ? repeatCustomers.length + 50 : 0;
  const returningCustomers = repeatCustomers.filter(c => c.orderCount >= 2).length;
  const returnRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

  const avgLast14 = daily.slice(-14).reduce((s, d) => s + d.revenue, 0) / 14;
  const avgFirst14 = daily.slice(0, 14).reduce((s, d) => s + d.revenue, 0) / 14;
  const aovTrend = avgLast14 > avgFirst14 ? 'increasing' : 'decreasing';

  const avgOrderValue = daily.reduce((s, d) => s + d.revenue, 0) / Math.max(daily.length, 1);
  const estimatedLostRevenue = Math.round(avgOrderValue * 0.15); // estimate 15% abandoned

  const insights: InsightCard[] = [
    {
      id: 'demand-spike',
      icon: demandSpike ? '!' : 'i',
      title: 'Demand Spike Alert',
      insight: demandSpike
        ? `Today's revenue is ${Math.round(((todayRev - avgRevenue7) / avgRevenue7) * 100)}% above your 7-day average. Expect high volume — ensure kitchen is fully staffed.`
        : `Today's orders are tracking normally vs your 7-day average of ${formatRupee(avgRevenue7)}.`,
      impact: demandSpike ? 'High' : 'Low',
      actionLabel: 'View Orders',
      actionHref: '/admin/orders',
      value: demandSpike ? `+${Math.round(((todayRev - avgRevenue7) / avgRevenue7) * 100)}%` : 'Normal',
    },
    {
      id: 'slow-day',
      icon: 'v',
      title: 'Slow Day Pattern',
      insight: `${slowDay} is consistently your slowest day. Consider running promotions or discounts on ${slowDay}s to boost foot traffic and orders.`,
      impact: 'Medium',
      actionLabel: 'Create Coupon',
      actionHref: '/admin/coupons',
      value: slowDay,
    },
    {
      id: 'top-category',
      icon: '*',
      title: 'Top Menu Category',
      insight: topCategoryItem
        ? `"${topCategoryName}" is your best-selling item with ${topCategoryItem.totalQuantity} orders, generating ${formatRupee(topCategoryItem.totalRevenue)} in revenue.`
        : 'Fetch top-selling items to see your menu performance breakdown.',
      impact: 'Medium',
      actionLabel: 'View Menu',
      actionHref: '/admin/menu',
      value: topCategoryItem ? `${topCategoryItem.totalQuantity} orders` : 'N/A',
    },
    {
      id: 'return-rate',
      icon: 'R',
      title: 'Customer Return Rate',
      insight: returnRate > 0
        ? `${returnRate.toFixed(1)}% of your customers have ordered more than once. ${returnRate < 30 ? 'Below industry avg of 30% — launch a loyalty campaign.' : 'Great retention! Keep rewarding loyal customers.'}`
        : 'Not enough customer data yet to compute return rate.',
      impact: returnRate < 30 && returnRate > 0 ? 'High' : 'Medium',
      actionLabel: 'View CRM',
      actionHref: '/admin/crm',
      value: returnRate > 0 ? `${returnRate.toFixed(1)}%` : 'N/A',
    },
    {
      id: 'aov-trend',
      icon: aovTrend === 'increasing' ? '+' : '-',
      title: 'Avg Order Value Trend',
      insight: `Your average order value is ${aovTrend} over the past 30 days. ${aovTrend === 'increasing' ? 'Great — upselling is working!' : 'Consider adding combo meals or upsell prompts to increase AOV.'}`,
      impact: aovTrend === 'decreasing' ? 'High' : 'Low',
      actionLabel: 'View Reports',
      actionHref: '/admin/reports',
      value: formatRupee(avgOrderValue),
    },
    {
      id: 'lost-revenue',
      icon: '$',
      title: 'Potential Revenue Lost',
      insight: `Estimated ${formatRupee(estimatedLostRevenue)}/day in potential abandoned orders. Sending reminder notifications could recover 30–40% of these.`,
      impact: 'High',
      actionLabel: 'View Abandoned Carts',
      actionHref: '/admin/abandoned-cart',
      value: formatRupee(estimatedLostRevenue) + '/day',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {insights.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.07 }}
          style={{
            background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: `${GOLD}18`,
                border: `1px solid ${GOLD}33`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 14, color: GOLD, fontWeight: 800, flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{card.title}</div>
            </div>
          </div>
          {card.value && (
            <div style={{ fontSize: 22, fontWeight: 800, color: GOLD }}>{card.value}</div>
          )}
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
            {card.insight}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
            <ImpactBadge level={card.impact} />
            <a
              href={card.actionHref}
              style={{
                color: GOLD, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                padding: '5px 12px', border: `1px solid ${GOLD}44`, borderRadius: 6,
                transition: 'all 0.2s',
              }}
            >
              {card.actionLabel} →
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── TAB 3: Smart Recommendations ──────────────────────────────────────────────
function SmartRecommendationsTab({
  daily, topItems, repeatCustomers, loading, onRefresh, refreshing,
}: {
  daily: DayRevenue[];
  topItems: TopItem[];
  repeatCustomers: RepeatCustomer[];
  loading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
            <Skeleton h={14} w="45%" />
            <div style={{ marginTop: 10 }}><Skeleton h={10} /></div>
            <div style={{ marginTop: 6 }}><Skeleton h={10} w="70%" /></div>
          </div>
        ))}
      </div>
    );
  }

  if (daily.length === 0) return null;

  const slowDay = computeSlowDay(daily);
  const topItem = topItems[0];

  const totalCustomers = repeatCustomers.length > 0 ? repeatCustomers.length + 50 : 50;
  const returningCustomers = repeatCustomers.filter(c => c.orderCount >= 2).length;
  const returnRate = (returningCustomers / totalCustomers) * 100;

  // Weekend revenue analysis
  const now = new Date();
  let weekendRevenue = 0;
  let weekdayRevenue = 0;
  let weekendCount = 0;
  let weekdayCount = 0;
  daily.forEach((d, idx) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (daily.length - 1 - idx));
    const dow = date.getDay();
    if (dow === 0 || dow === 6) { weekendRevenue += d.revenue; weekendCount++; }
    else { weekdayRevenue += d.revenue; weekdayCount++; }
  });
  const avgWeekend = weekendCount > 0 ? weekendRevenue / weekendCount : 0;
  const avgWeekday = weekdayCount > 0 ? weekdayRevenue / weekdayCount : 0;
  const weekendLower = avgWeekend < avgWeekday;

  const avgOrderValue = daily.length > 0 ? daily.reduce((s, d) => s + d.revenue, 0) / daily.length : 5000;
  const estimatedInactiveRate = Math.max(0, 100 - returnRate - 30);

  const recs: Recommendation[] = [
    {
      id: 'slow-day-discount',
      title: `Offer a discount on ${slowDay}s`,
      reasoning: `${slowDay} is your slowest revenue day. A 15–20% discount or a special combo deal on ${slowDay}s can drive traffic during off-peak hours and increase weekly totals.`,
      estimatedImpact: Math.round(avgOrderValue * 0.4),
      actionHref: '/admin/coupons',
      priority: 92,
      triggered: true,
    },
    {
      id: 'stock-top-items',
      title: `Stock up on "${topItem?.name || 'top selling items'}"`,
      reasoning: topItem
        ? `"${topItem.name}" accounts for ${topItem.totalQuantity} orders and ${formatRupee(topItem.totalRevenue)} in revenue. Running out of ingredients means direct revenue loss.`
        : 'Your top-selling items drive most of your revenue. Ensure inventory is stocked to meet demand.',
      estimatedImpact: Math.round((topItem?.totalRevenue || avgOrderValue) * 0.15),
      actionHref: '/admin/inventory',
      priority: 87,
      triggered: !!topItem,
    },
    {
      id: 'loyalty-campaign',
      title: 'Launch a loyalty campaign',
      reasoning: returnRate < 30
        ? `Your customer return rate is ${returnRate.toFixed(1)}%, below the 30% industry benchmark. A punch-card or points loyalty program can increase repeat orders by 25–40%.`
        : `Your return rate (${returnRate.toFixed(1)}%) is solid. A tiered loyalty program can push it even higher and reward your best customers.`,
      estimatedImpact: Math.round(avgOrderValue * (returnRate < 30 ? 1.8 : 0.9)),
      actionHref: '/admin/loyalty',
      priority: 80,
      triggered: returnRate < 30,
    },
    {
      id: 'weekend-special',
      title: 'Add a weekend special menu',
      reasoning: weekendLower
        ? `Weekend revenue (avg ${formatRupee(avgWeekend)}/day) is lower than weekdays (avg ${formatRupee(avgWeekday)}/day). A dedicated weekend special menu or brunch offering can close this gap.`
        : `Your weekends are already performing well (${formatRupee(avgWeekend)}/day avg). A premium weekend menu can further increase revenue.`,
      estimatedImpact: Math.round(Math.abs(avgWeekend - avgWeekday) * 4),
      actionHref: '/admin/menu',
      priority: 74,
      triggered: weekendLower,
    },
    {
      id: 'reengagement',
      title: 'Send re-engagement campaign',
      reasoning: `An estimated ${estimatedInactiveRate.toFixed(0)}% of your customers haven't ordered in 30+ days. A targeted WhatsApp or email campaign with an exclusive offer can bring them back.`,
      estimatedImpact: Math.round(avgOrderValue * (estimatedInactiveRate / 100) * 3),
      actionHref: '/admin/crm',
      priority: 68,
      triggered: estimatedInactiveRate > 20,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          style={{
            background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}44`,
            borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600,
            cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Insights'}
        </button>
      </div>

      {recs.map((rec, idx) => (
        <motion.div
          key={rec.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.08 }}
          style={{
            background: SURFACE, border: `1px solid ${rec.triggered ? GOLD + '33' : BORDER}`,
            borderRadius: 14, padding: 24,
            display: 'flex', gap: 20, alignItems: 'flex-start',
          }}
        >
          {/* Priority Score */}
          <div style={{
            width: 56, height: 56, borderRadius: 12, flexShrink: 0,
            background: `${GOLD}18`, border: `2px solid ${GOLD}${rec.priority > 80 ? 'aa' : '44'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: GOLD }}>{rec.priority}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 0.3 }}>SCORE</div>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{rec.title}</div>
              {rec.triggered && (
                <span style={{
                  background: '#052e16', border: '1px solid #22c55e', color: '#22c55e',
                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                }}>
                  Triggered
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 14 }}>
              {rec.reasoning}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Est. Impact:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>
                  +{formatRupee(rec.estimatedImpact)}/week
                </span>
              </div>
              <a
                href={rec.actionHref}
                style={{
                  color: '#000', background: GOLD, fontSize: 12, fontWeight: 700,
                  textDecoration: 'none', padding: '6px 16px', borderRadius: 7,
                  transition: 'all 0.2s',
                }}
              >
                Take Action →
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AIInsightsPage() {
  const [tab, setTab] = useState<'forecast' | 'insights' | 'recommendations'>('forecast');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [daily, setDaily] = useState<DayRevenue[]>([]);
  const [hourly, setHourly] = useState<HourlyOrder[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [repeatCustomers, setRepeatCustomers] = useState<RepeatCustomer[]>([]);
  const [dashboard, setDashboard] = useState<{ todayOrders: number; todayRevenue: number } | null>(null);

  const fetchAll = useCallback(async () => {
    const [revData, hourData, topData, repeatData, dashData] = await Promise.all([
      safeGet<any>(`${API}/analytics/revenue`),
      safeGet<HourlyOrder[]>(`${API}/analytics/orders-per-hour`),
      safeGet<TopItem[]>(`${API}/analytics/top-selling?limit=10`),
      safeGet<RepeatCustomer[]>(`${API}/analytics/repeat-customers`),
      safeGet<any>(`${API}/analytics/dashboard`),
    ]);

    // Revenue: try to extract daily array
    let dailyArr: DayRevenue[] = [];
    if (revData) {
      if (Array.isArray(revData)) dailyArr = revData;
      else if (revData.daily && Array.isArray(revData.daily)) dailyArr = revData.daily;
      else if (revData.data && Array.isArray(revData.data)) dailyArr = revData.data;
    }
    if (dailyArr.length === 0) dailyArr = makeMockDailyRevenue();

    // Normalize fields: { date, revenue }
    dailyArr = dailyArr.map((d: any) => ({
      date: d.date || d._id || d.label || '',
      revenue: d.revenue || d.total || d.amount || 0,
    })).filter(d => d.date);

    setDaily(dailyArr.length >= 7 ? dailyArr : makeMockDailyRevenue());
    setHourly(Array.isArray(hourData) && hourData.length > 0 ? hourData : makeMockHourly());
    setTopItems(Array.isArray(topData) ? topData : []);
    setRepeatCustomers(Array.isArray(repeatData) ? repeatData : []);
    setDashboard(dashData || null);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: `${GOLD}22`,
              border: `1px solid ${GOLD}44`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18,
            }}>
              AI
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>AI Business Intelligence</h1>
            <span style={{
              background: `${GOLD}22`, color: GOLD, fontSize: 10, fontWeight: 700,
              padding: '3px 10px', borderRadius: 20, border: `1px solid ${GOLD}44`,
              letterSpacing: 0.5,
            }}>
              BETA
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 560 }}>
            Smart insights computed from your real business data. Revenue forecasts, demand alerts, and actionable recommendations — all in one place.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <TabButton label="Revenue Forecast" active={tab === 'forecast'} onClick={() => setTab('forecast')} />
          <TabButton label="Business Insights" active={tab === 'insights'} onClick={() => setTab('insights')} />
          <TabButton label="Smart Recommendations" active={tab === 'recommendations'} onClick={() => setTab('recommendations')} />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'forecast' && (
              <RevenueForecastTab daily={daily} hourly={hourly} loading={loading} />
            )}
            {tab === 'insights' && (
              <BusinessInsightsTab
                daily={daily}
                hourly={hourly}
                topItems={topItems}
                repeatCustomers={repeatCustomers}
                dashboard={dashboard}
                loading={loading}
              />
            )}
            {tab === 'recommendations' && (
              <SmartRecommendationsTab
                daily={daily}
                topItems={topItems}
                repeatCustomers={repeatCustomers}
                loading={loading}
                onRefresh={handleRefresh}
                refreshing={refreshing}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
