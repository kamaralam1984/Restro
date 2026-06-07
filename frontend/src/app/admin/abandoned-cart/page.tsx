'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────────────────
interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface AbandonedCart {
  _id: string;
  customerPhone: string;
  customerEmail?: string;
  customerName?: string;
  items: CartItem[];
  cartTotal: number;
  tableNumber?: string;
  slug: string;
  status: 'pending' | 'reminder_sent' | 'recovered' | 'ignored';
  reminderSentAt?: string;
  reminderCount: number;
  recoveredAt?: string;
  source: 'qr_order' | 'online' | 'pos';
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  reminderSent: number;
  recovered: number;
  ignored: number;
  totalValue: number;
  recoveredValue: number;
  recoveryRate: number;
  avgCartValue: number;
  dailyData: Array<{ _id: { date: string; status: string }; count: number; value: number }>;
  topItems: Array<{ _id: string; count: number; revenue: number }>;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const API = 'http://localhost:5000/api/abandoned-cart';
const GOLD = '#c8972a';
const BG = '#080808';
const SURFACE = '#141414';
const SURFACE2 = '#1a1a1a';
const BORDER = 'rgba(200,151,42,0.18)';

const STATUS_COLORS: Record<string, string> = {
  pending: '#ef4444',
  reminder_sent: '#f59e0b',
  recovered: '#22c55e',
  ignored: '#6b7280',
};

const SOURCE_LABELS: Record<string, string> = {
  qr_order: 'QR',
  online: 'Online',
  pos: 'POS',
};

const DELAY_OPTIONS = ['30min', '1hr', '2hr', '24hr'];

const TEMPLATES = [
  {
    id: 1,
    label: 'Immediate (0–30 min)',
    body: 'Hi {name}, aapne {restaurant} me {items} cart me chhod diye! Complete your order: {link}',
  },
  {
    id: 2,
    label: '1-Hour Reminder',
    body: 'Reminder: Aapka cart abhi bhi wait kar raha hai! Items: {items} | Total: ₹{total}',
  },
  {
    id: 3,
    label: '24-Hour Last Chance',
    body: 'Last chance! Aapke cart me ₹{total} ke items hain. Order karo aaj!',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatRupee(n: number) {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function buildWhatsAppMessage(cart: AbandonedCart, restaurantName: string) {
  const itemList = cart.items.map((i) => `${i.name} x${i.quantity}`).join(', ');
  const link = `http://localhost:3010/r/${cart.slug}`;
  return `Hi ${cart.customerName || cart.customerPhone},\n\naapne *${restaurantName}* me in items ko cart me chhod diya:\n${itemList}\n\n*Total: ${formatRupee(cart.cartTotal)}*\n\nApna order complete karo: ${link}`;
}

// ── Components ─────────────────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#6b7280';
  const label = status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span
      style={{
        background: color + '22',
        color,
        border: `1px solid ${color}55`,
        borderRadius: 20,
        padding: '2px 10px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = { qr_order: '#60a5fa', online: '#a78bfa', pos: '#34d399' };
  const color = colors[source] || '#9ca3af';
  return (
    <span
      style={{
        background: color + '22',
        color,
        border: `1px solid ${color}44`,
        borderRadius: 4,
        padding: '1px 7px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.8,
      }}
    >
      {SOURCE_LABELS[source] || source}
    </span>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px',
        borderRadius: 8,
        border: active ? `1px solid ${GOLD}` : '1px solid rgba(255,255,255,0.08)',
        background: active ? GOLD + '22' : 'transparent',
        color: active ? GOLD : 'rgba(255,255,255,0.5)',
        fontWeight: active ? 700 : 400,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 14px',
        borderRadius: 20,
        border: active ? `1px solid ${GOLD}` : '1px solid rgba(255,255,255,0.1)',
        background: active ? GOLD : 'transparent',
        color: active ? '#000' : 'rgba(255,255,255,0.6)',
        fontWeight: 600,
        fontSize: 12,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div
      style={{
        background: SURFACE,
        border: BORDER,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 12,
        padding: '20px 24px',
        flex: 1,
        minWidth: 160,
      }}
    >
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ color: accent || GOLD, fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Reminder Modal ─────────────────────────────────────────────────────────────
function ReminderModal({
  cart,
  onClose,
  onSent,
}: {
  cart: AbandonedCart;
  onClose: () => void;
  onSent: () => void;
}) {
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const restaurantName = admin.restaurantName || admin.name || 'Restaurant';
  const [msg] = useState(() => buildWhatsAppMessage(cart, restaurantName));
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const markSent = async () => {
    setSending(true);
    try {
      await fetch(`${API}/${cart._id}/remind`, { method: 'POST', headers: authHeaders() });
      onSent();
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 16, padding: 28, width: '100%', maxWidth: 520 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: GOLD, margin: 0, fontSize: 17, fontWeight: 700 }}>WhatsApp Reminder Preview</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Send to: {cart.customerPhone}
        </div>

        <div
          style={{
            background: '#0b1e11',
            border: '1px solid #22c55e44',
            borderRadius: 12,
            padding: '16px 18px',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 14,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            marginBottom: 20,
          }}
        >
          {msg}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 20, fontStyle: 'italic' }}>
          Cart items: {cart.items.map((i) => `${i.name} x${i.quantity}`).join(' • ')}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={copy}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${GOLD}`,
              background: 'transparent', color: GOLD, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            {copied ? 'Copied!' : 'Copy Message'}
          </button>
          <button
            onClick={markSent}
            disabled={sending}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
              background: GOLD, color: '#000', fontWeight: 700, fontSize: 13, cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? 'Saving…' : 'Mark as Sent'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── SVG Bar Chart ──────────────────────────────────────────────────────────────
function BarChart({ dailyData }: { dailyData: Stats['dailyData'] }) {
  const width = 560;
  const height = 180;
  const padL = 40;
  const padB = 32;
  const padT = 16;
  const chartW = width - padL - 16;
  const chartH = height - padB - padT;

  // Build 7-day buckets
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().slice(0, 10));
  }

  const byDay: Record<string, { abandoned: number; recovered: number }> = {};
  days.forEach((d) => (byDay[d] = { abandoned: 0, recovered: 0 }));
  dailyData.forEach((row) => {
    const d = row._id.date;
    if (!byDay[d]) return;
    if (row._id.status === 'recovered') byDay[d].recovered += row.count;
    else byDay[d].abandoned += row.count;
  });

  const maxVal = Math.max(1, ...days.map((d) => byDay[d].abandoned + byDay[d].recovered));
  const barW = (chartW / days.length) * 0.35;
  const gap = barW * 0.4;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {/* Y-axis grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padT + chartH - pct * chartH;
        return (
          <g key={pct}>
            <line x1={padL} x2={padL + chartW} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={padL - 6} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize={9} textAnchor="end">
              {Math.round(pct * maxVal)}
            </text>
          </g>
        );
      })}

      {days.map((day, i) => {
        const slot = byDay[day];
        const slotW = chartW / days.length;
        const cx = padL + i * slotW + slotW / 2;
        const aH = (slot.abandoned / maxVal) * chartH;
        const rH = (slot.recovered / maxVal) * chartH;

        return (
          <g key={day}>
            {/* Abandoned bar */}
            <rect
              x={cx - barW - gap / 2}
              y={padT + chartH - aH}
              width={barW}
              height={aH}
              fill="#ef444488"
              rx={3}
            />
            {/* Recovered bar */}
            <rect
              x={cx + gap / 2}
              y={padT + chartH - rH}
              width={barW}
              height={rH}
              fill="#22c55e88"
              rx={3}
            />
            <text x={cx} y={padT + chartH + 16} fill="rgba(255,255,255,0.35)" fontSize={9} textAnchor="middle">
              {day.slice(5)}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={padL} y={height - 10} width={10} height={6} fill="#ef444488" rx={2} />
      <text x={padL + 13} y={height - 4} fill="rgba(255,255,255,0.45)" fontSize={9}>Abandoned</text>
      <rect x={padL + 75} y={height - 10} width={10} height={6} fill="#22c55e88" rx={2} />
      <text x={padL + 88} y={height - 4} fill="rgba(255,255,255,0.45)" fontSize={9}>Recovered</text>
    </svg>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AbandonedCartPage() {
  const [activeTab, setActiveTab] = useState<'carts' | 'campaigns' | 'stats'>('carts');
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reminderCart, setReminderCart] = useState<AbandonedCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [editTemplates, setEditTemplates] = useState<Record<number, string>>({});
  const [autoDelay, setAutoDelay] = useState(() => localStorage.getItem('cartReminderDelay') || '1hr');

  const loadCarts = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const r = await fetch(`${API}${params}`, { headers: authHeaders() });
      const data = await r.json();
      setCarts(data.carts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const r = await fetch(`${API}/stats`, { headers: authHeaders() });
      const data = await r.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'carts') loadCarts();
    if (activeTab === 'stats') loadStats();
  }, [activeTab, statusFilter, loadCarts, loadStats]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${API}/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      loadCarts();
    } catch (e) {
      console.error(e);
    }
  };

  const setDelay = (d: string) => {
    setAutoDelay(d);
    localStorage.setItem('cartReminderDelay', d);
  };

  const getTemplate = (id: number) => editTemplates[id] ?? TEMPLATES.find((t) => t.id === id)?.body ?? '';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: GOLD, letterSpacing: -0.5 }}>
          Abandoned Cart Recovery
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', fontSize: 13 }}>
          Track and recover abandoned customer carts
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        <TabButton label="Abandoned Carts" active={activeTab === 'carts'} onClick={() => setActiveTab('carts')} />
        <TabButton label="Recovery Campaigns" active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} />
        <TabButton label="Stats & Analytics" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
      </div>

      {/* ── TAB 1: Abandoned Carts ──────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'carts' && (
          <motion.div key="carts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {['all', 'pending', 'reminder_sent', 'recovered', 'ignored'].map((s) => (
                <FilterTab
                  key={s}
                  label={s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                />
              ))}
            </div>

            {loading ? (
              <div style={{ color: GOLD, textAlign: 'center', padding: 48 }}>Loading…</div>
            ) : carts.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60, fontSize: 15 }}>
                No abandoned carts found
              </div>
            ) : (
              <div style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Customer', 'Items', 'Cart Total', 'Source', 'Status', 'Time', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {carts.map((cart, idx) => (
                      <tr
                        key={cart._id}
                        style={{
                          borderBottom: idx < carts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.04)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)')}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>
                            {cart.customerName || '—'}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{cart.customerPhone}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{cart.items.length} items</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cart.items.map((i) => i.name).join(', ')}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: GOLD, fontWeight: 700, fontSize: 14 }}>
                          {formatRupee(cart.cartTotal)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <SourceBadge source={cart.source} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge status={cart.status} />
                          {cart.reminderCount > 0 && (
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 3 }}>
                              {cart.reminderCount} reminder{cart.reminderCount > 1 ? 's' : ''} sent
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {timeAgo(cart.createdAt)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {cart.status !== 'recovered' && cart.status !== 'ignored' && (
                              <button
                                onClick={() => setReminderCart(cart)}
                                style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${GOLD}`, background: 'transparent', color: GOLD, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                Send Reminder
                              </button>
                            )}
                            {cart.status !== 'recovered' && (
                              <button
                                onClick={() => updateStatus(cart._id, 'recovered')}
                                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #22c55e66', background: '#22c55e11', color: '#22c55e', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                Recovered
                              </button>
                            )}
                            {cart.status !== 'ignored' && cart.status !== 'recovered' && (
                              <button
                                onClick={() => updateStatus(cart._id, 'ignored')}
                                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(107,114,128,0.4)', background: 'transparent', color: '#9ca3af', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                              >
                                Ignore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB 2: Recovery Campaigns ───────────────────────────────────────── */}
        {activeTab === 'campaigns' && (
          <motion.div key="campaigns" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Note banner */}
            <div style={{ background: 'rgba(200,151,42,0.08)', border: `1px solid ${GOLD}33`, borderRadius: 10, padding: '12px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: GOLD, fontSize: 16, marginTop: 1 }}>ℹ</span>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6 }}>
                <strong style={{ color: GOLD }}>Note:</strong> Actual WhatsApp/SMS sending requires Twilio or Gupshup integration. Use "Copy Message" to manually send via WhatsApp Web, or integrate your preferred SMS gateway.
              </p>
            </div>

            {/* Auto-send settings */}
            <div style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: GOLD, marginBottom: 14, fontSize: 14 }}>Auto-Send Delay Setting</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginRight: 4 }}>Send reminder after:</span>
                {DELAY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDelay(d)}
                    style={{
                      padding: '6px 16px', borderRadius: 20,
                      border: autoDelay === d ? `1px solid ${GOLD}` : '1px solid rgba(255,255,255,0.12)',
                      background: autoDelay === d ? GOLD : 'transparent',
                      color: autoDelay === d ? '#000' : 'rgba(255,255,255,0.6)',
                      fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 10 }}>
                Saved locally — connect to your automation workflow to activate
              </div>
            </div>

            {/* Template cards */}
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {TEMPLATES.map((t) => {
                const body = editTemplates[t.id] ?? t.body;
                const [editing, setEditing] = useState(false);
                const [copied, setCopied] = useState(false);
                return (
                  <div key={t.id} style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ color: GOLD, fontWeight: 700, fontSize: 13 }}>Template {t.id}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{t.label}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(body);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${GOLD}44`, background: 'transparent', color: GOLD, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => setEditing(!editing)}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                        >
                          {editing ? 'Done' : 'Edit'}
                        </button>
                      </div>
                    </div>

                    {editing ? (
                      <textarea
                        value={body}
                        onChange={(e) => setEditTemplates((p) => ({ ...p, [t.id]: e.target.value }))}
                        style={{
                          width: '100%', minHeight: 100, background: SURFACE2, border: `1px solid ${GOLD}33`,
                          borderRadius: 8, color: '#fff', fontSize: 13, padding: 10, resize: 'vertical',
                          fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box',
                        }}
                      />
                    ) : (
                      <div style={{ background: SURFACE2, borderRadius: 8, padding: '12px 14px', color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', minHeight: 80 }}>
                        {body}
                      </div>
                    )}

                    <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
                      Variables: {'{name}'} {'{restaurant}'} {'{items}'} {'{total}'} {'{link}'}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── TAB 3: Stats ─────────────────────────────────────────────────────── */}
        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {!stats ? (
              <div style={{ color: GOLD, textAlign: 'center', padding: 48 }}>Loading stats…</div>
            ) : (
              <>
                {/* KPI cards */}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
                  <KpiCard label="Total Abandoned" value={formatRupee(stats.totalValue)} sub={`${stats.total} carts`} />
                  <KpiCard label="Recovered" value={formatRupee(stats.recoveredValue)} sub={`${stats.recovered} carts`} accent="#22c55e" />
                  <KpiCard label="Recovery Rate" value={`${stats.recoveryRate}%`} sub="of all carts" accent={stats.recoveryRate >= 20 ? '#22c55e' : '#ef4444'} />
                  <KpiCard label="Avg Cart Value" value={formatRupee(stats.avgCartValue)} sub="per cart" />
                </div>

                {/* Status breakdown */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                  {[
                    { label: 'Pending', value: stats.pending, color: '#ef4444' },
                    { label: 'Reminder Sent', value: stats.reminderSent, color: '#f59e0b' },
                    { label: 'Recovered', value: stats.recovered, color: '#22c55e' },
                    { label: 'Ignored', value: stats.ignored, color: '#6b7280' },
                  ].map((s) => (
                    <div key={s.label} style={{ background: SURFACE, border: `1px solid ${s.color}33`, borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{s.label}:</span>
                      <span style={{ color: s.color, fontWeight: 700, fontSize: 14 }}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                  <div style={{ fontWeight: 700, color: GOLD, marginBottom: 16, fontSize: 14 }}>Last 7 Days — Abandoned vs Recovered</div>
                  <BarChart dailyData={stats.dailyData} />
                </div>

                {/* Top abandoned items */}
                <div style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 12, padding: 24 }}>
                  <div style={{ fontWeight: 700, color: GOLD, marginBottom: 16, fontSize: 14 }}>Top Abandoned Items</div>
                  {stats.topItems.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No data yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {stats.topItems.map((item, i) => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: SURFACE2, borderRadius: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: GOLD, fontWeight: 800, fontSize: 13, width: 20 }}>#{i + 1}</span>
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{item._id}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{item.count} units abandoned</span>
                            <span style={{ color: GOLD, fontWeight: 700, fontSize: 13 }}>{formatRupee(item.revenue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminder Modal */}
      <AnimatePresence>
        {reminderCart && (
          <ReminderModal
            cart={reminderCart}
            onClose={() => setReminderCart(null)}
            onSent={loadCarts}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
