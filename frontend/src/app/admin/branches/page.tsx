'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BranchFeatures {
  onlineOrdering: boolean;
  tableBooking: boolean;
  delivery: boolean;
}

interface Branch {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  managerName?: string;
  managerPhone?: string;
  status: 'active' | 'inactive' | 'setup';
  monthlyRevenue: number;
  totalOrders: number;
  avgRating: number;
  openingTime: string;
  closingTime: string;
  features: BranchFeatures;
}

interface BranchSummary {
  totalBranches: number;
  totalRevenue: number;
  totalOrders: number;
  topBranch: { name: string; city: string; revenue: number } | null;
}

interface BranchMetric {
  date: string;
  orders: number;
  revenue: number;
  avgOrderValue: number;
  newCustomers: number;
}

interface BranchMetricsResponse {
  branch: Branch;
  metrics: BranchMetric[];
  summary: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    newCustomers: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API = 'http://localhost:5000/api';
const BG = '#080808';
const SURFACE = '#141414';
const GOLD = '#c8972a';
const GOLD_DIM = '#a07520';
const BORDER = '#2a2a2a';
const TEXT = '#f0f0f0';
const TEXT_DIM = '#888';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

function authHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(n));
}

function statusColor(s: string): string {
  if (s === 'active') return '#22c55e';
  if (s === 'inactive') return '#ef4444';
  return GOLD;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryStrip({ summary }: { summary: BranchSummary | null }) {
  const items = [
    { label: 'Total Branches', value: summary?.totalBranches ?? '—' },
    { label: 'Total Revenue (₹)', value: summary ? fmt(summary.totalRevenue) : '—' },
    { label: 'Total Orders', value: summary ? fmt(summary.totalOrders) : '—' },
    {
      label: 'Top Branch',
      value: summary?.topBranch ? `${summary.topBranch.name} (${summary.topBranch.city})` : '—',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            padding: '14px 18px',
          }}
        >
          <div style={{ color: TEXT_DIM, fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
            {item.label}
          </div>
          <div style={{ color: GOLD, fontSize: 18, fontWeight: 700 }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function FeatureTag({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: '2px 7px',
        borderRadius: 4,
        background: active ? 'rgba(200,151,42,0.18)' : 'rgba(255,255,255,0.04)',
        color: active ? GOLD : TEXT_DIM,
        border: `1px solid ${active ? GOLD_DIM : BORDER}`,
        marginRight: 4,
      }}
    >
      {label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EMPTY_BRANCH = {
  name: '', address: '', city: '', phone: '', email: '',
  managerName: '', managerPhone: '', status: 'setup' as const,
  openingTime: '09:00', closingTime: '22:00',
  features: { onlineOrdering: false, tableBooking: false, delivery: false },
};

export default function BranchesPage() {
  const [tab, setTab] = useState<'list' | 'analytics' | 'add'>('list');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [summary, setSummary] = useState<BranchSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [branchMetrics, setBranchMetrics] = useState<BranchMetricsResponse | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editForm, setEditForm] = useState<typeof EMPTY_BRANCH>({ ...EMPTY_BRANCH });

  // Metrics modal
  const [metricsModal, setMetricsModal] = useState(false);

  // Add branch form
  const [addForm, setAddForm] = useState({ ...EMPTY_BRANCH });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      const [brRes, sumRes] = await Promise.all([
        fetch(`${API}/branches`, { headers: authHeaders() }),
        fetch(`${API}/branches/summary`, { headers: authHeaders() }),
      ]);
      if (brRes.ok) {
        const d = await brRes.json();
        setBranches(d.branches || []);
      }
      if (sumRes.ok) {
        setSummary(await sumRes.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBranches(); }, [loadBranches]);

  const loadMetrics = async (id: string) => {
    try {
      setMetricsLoading(true);
      const res = await fetch(`${API}/branches/${id}/metrics`, { headers: authHeaders() });
      if (res.ok) setBranchMetrics(await res.json());
    } catch {
      // silent
    } finally {
      setMetricsLoading(false);
    }
  };

  const openEdit = (b: Branch) => {
    setEditingBranch(b);
    setEditForm({
      name: b.name, address: b.address, city: b.city,
      phone: b.phone, email: b.email,
      managerName: b.managerName || '', managerPhone: b.managerPhone || '',
      status: b.status, openingTime: b.openingTime, closingTime: b.closingTime,
      features: { ...b.features },
    });
    setEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingBranch) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/branches/${editingBranch._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditModal(false);
        await loadBranches();
      } else {
        const d = await res.json();
        setMsg(d.error || 'Update failed');
      }
    } catch {
      setMsg('Network error');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: string) => {
    if (!confirm('Deactivate this branch?')) return;
    try {
      await fetch(`${API}/branches/${id}`, { method: 'DELETE', headers: authHeaders() });
      await loadBranches();
    } catch {
      // silent
    }
  };

  const saveBranch = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(`${API}/branches`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        setMsg('Branch created successfully!');
        setAddForm({ ...EMPTY_BRANCH });
        await loadBranches();
        setTimeout(() => setTab('list'), 1200);
      } else {
        const d = await res.json();
        setMsg(d.error || 'Failed to create branch');
      }
    } catch {
      setMsg('Network error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Styles ────────────────────────────────────────────────────────────────

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: BG,
    color: TEXT,
    fontFamily: "'Inter', sans-serif",
    padding: '24px 28px',
  };

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '9px 22px',
    borderRadius: 7,
    border: `1px solid ${active ? GOLD : BORDER}`,
    background: active ? 'rgba(200,151,42,0.12)' : 'transparent',
    color: active ? GOLD : TEXT_DIM,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    transition: 'all 0.2s',
  });

  const inputStyle: React.CSSProperties = {
    background: '#0f0f0f',
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    color: TEXT,
    padding: '9px 12px',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: TEXT_DIM,
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  };

  const btnPrimary: React.CSSProperties = {
    background: GOLD,
    color: '#000',
    border: 'none',
    borderRadius: 8,
    padding: '10px 22px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  };

  const btnSecondary: React.CSSProperties = {
    background: 'transparent',
    color: TEXT_DIM,
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 12,
    cursor: 'pointer',
  };

  const cardStyle: React.CSSProperties = {
    background: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: 18,
    position: 'relative',
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0 }}>
          Branch Management
        </h1>
        <p style={{ color: TEXT_DIM, fontSize: 13, margin: '4px 0 0' }}>
          Manage all your restaurant branches from one place
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['list', 'analytics', 'add'] as const).map((t) => (
          <button key={t} style={tabBtnStyle(tab === t)} onClick={() => setTab(t)}>
            {t === 'list' ? 'All Branches' : t === 'analytics' ? 'Branch Analytics' : 'Add Branch'}
          </button>
        ))}
      </div>

      {/* ── TAB 1: ALL BRANCHES ─────────────────────────────────────────────── */}
      {tab === 'list' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <SummaryStrip summary={summary} />

          {loading ? (
            <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 48 }}>Loading branches...</div>
          ) : branches.length === 0 ? (
            <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 48 }}>
              No branches yet. Click "Add Branch" to create one.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {branches.map((b) => (
                <motion.div
                  key={b._id}
                  style={cardStyle}
                  whileHover={{ borderColor: GOLD_DIM, scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{b.name}</span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 8px',
                            borderRadius: 20,
                            background: `${statusColor(b.status)}22`,
                            color: statusColor(b.status),
                            border: `1px solid ${statusColor(b.status)}44`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div style={{ color: TEXT_DIM, fontSize: 12, marginTop: 2 }}>
                        {b.city} — {b.address.substring(0, 40)}{b.address.length > 40 ? '...' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                    <div>
                      <div style={{ color: TEXT_DIM, fontSize: 10, textTransform: 'uppercase' }}>Revenue</div>
                      <div style={{ color: GOLD, fontSize: 14, fontWeight: 700 }}>₹{fmt(b.monthlyRevenue)}</div>
                    </div>
                    <div>
                      <div style={{ color: TEXT_DIM, fontSize: 10, textTransform: 'uppercase' }}>Orders</div>
                      <div style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>{fmt(b.totalOrders)}</div>
                    </div>
                    <div>
                      <div style={{ color: TEXT_DIM, fontSize: 10, textTransform: 'uppercase' }}>Rating</div>
                      <div style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>{b.avgRating > 0 ? `${b.avgRating}/5` : '—'}</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 8 }}>
                    <span>📞 {b.phone}</span>
                    {b.managerName && <span style={{ marginLeft: 12 }}>👤 {b.managerName}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 10 }}>
                    🕐 {b.openingTime} – {b.closingTime}
                  </div>

                  {/* Feature tags */}
                  <div style={{ marginBottom: 12 }}>
                    <FeatureTag label="Online" active={b.features.onlineOrdering} />
                    <FeatureTag label="Booking" active={b.features.tableBooking} />
                    <FeatureTag label="Delivery" active={b.features.delivery} />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
                    <button style={btnSecondary} onClick={() => openEdit(b)}>Edit</button>
                    <button
                      style={{ ...btnSecondary, color: GOLD, borderColor: GOLD_DIM }}
                      onClick={() => {
                        setSelectedBranch(b._id);
                        loadMetrics(b._id);
                        setMetricsModal(true);
                      }}
                    >
                      View Metrics
                    </button>
                    {b.status !== 'inactive' && (
                      <button
                        style={{ ...btnSecondary, color: '#ef4444', borderColor: '#ef444444' }}
                        onClick={() => deactivate(b._id)}
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── TAB 2: ANALYTICS ────────────────────────────────────────────────── */}
      {tab === 'analytics' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Branch selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Select Branch</label>
            <select
              style={{ ...inputStyle, width: 280 }}
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                if (e.target.value) loadMetrics(e.target.value);
              }}
            >
              <option value="">-- Select a branch --</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name} ({b.city})</option>
              ))}
            </select>
          </div>

          {/* KPI Cards */}
          {selectedBranch && branchMetrics && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Orders (30d)', value: fmt(branchMetrics.summary.totalOrders) },
                  { label: 'Total Revenue (30d)', value: `₹${fmt(branchMetrics.summary.totalRevenue)}` },
                  { label: 'Avg Order Value', value: `₹${fmt(branchMetrics.summary.avgOrderValue)}` },
                  { label: 'New Customers', value: fmt(branchMetrics.summary.newCustomers) },
                ].map((kpi) => (
                  <div key={kpi.label} style={cardStyle}>
                    <div style={{ color: TEXT_DIM, fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>{kpi.label}</div>
                    <div style={{ color: GOLD, fontSize: 22, fontWeight: 700 }}>{kpi.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metricsLoading && (
            <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 32 }}>Loading metrics...</div>
          )}

          {/* Comparison table */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12 }}>
              All Branches Comparison
            </div>
            <div style={{ ...cardStyle, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Branch', 'City', 'Status', 'Revenue (₹)', 'Orders', 'Avg Order (₹)', 'Rating'].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          color: TEXT_DIM,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          borderBottom: `1px solid ${BORDER}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {branches
                    .filter((b) => b.status !== 'inactive')
                    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                    .map((b, idx, arr) => {
                      const isTop = idx === 0;
                      const isBottom = idx === arr.length - 1 && arr.length > 1;
                      const rowColor = isTop ? '#22c55e22' : isBottom ? '#ef444422' : 'transparent';
                      const textAccent = isTop ? '#22c55e' : isBottom ? '#ef4444' : TEXT;
                      return (
                        <tr key={b._id} style={{ background: rowColor }}>
                          <td style={{ padding: '10px 12px', color: textAccent, fontWeight: 600 }}>{b.name}</td>
                          <td style={{ padding: '10px 12px', color: TEXT_DIM }}>{b.city}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ color: statusColor(b.status), textTransform: 'capitalize' }}>{b.status}</span>
                          </td>
                          <td style={{ padding: '10px 12px', color: GOLD, fontWeight: 600 }}>₹{fmt(b.monthlyRevenue)}</td>
                          <td style={{ padding: '10px 12px', color: TEXT }}>{fmt(b.totalOrders)}</td>
                          <td style={{ padding: '10px 12px', color: TEXT }}>
                            {b.totalOrders > 0 ? `₹${fmt(b.monthlyRevenue / b.totalOrders)}` : '—'}
                          </td>
                          <td style={{ padding: '10px 12px', color: TEXT }}>
                            {b.avgRating > 0 ? `${b.avgRating}/5` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {branches.filter((b) => b.status !== 'inactive').length === 0 && (
                <div style={{ textAlign: 'center', color: TEXT_DIM, padding: 24 }}>No active branches</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12 }}>
              <span style={{ color: '#22c55e' }}>Green = Top Branch</span>
              <span style={{ color: '#ef4444' }}>Red = Bottom Branch</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 3: ADD BRANCH ───────────────────────────────────────────────── */}
      {tab === 'add' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 20 }}>New Branch Details</div>

            {msg && (
              <div
                style={{
                  background: msg.includes('success') ? '#22c55e22' : '#ef444422',
                  border: `1px solid ${msg.includes('success') ? '#22c55e' : '#ef4444'}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: msg.includes('success') ? '#22c55e' : '#ef4444',
                }}
              >
                {msg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Branch Name */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Branch Name *</label>
                <input
                  style={inputStyle}
                  value={addForm.name}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Connaught Place Branch"
                />
              </div>

              {/* Address */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Address *</label>
                <input
                  style={inputStyle}
                  value={addForm.address}
                  onChange={(e) => setAddForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Full address"
                />
              </div>

              {/* City */}
              <div>
                <label style={labelStyle}>City *</label>
                <input
                  style={inputStyle}
                  value={addForm.city}
                  onChange={(e) => setAddForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="e.g. New Delhi"
                />
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone *</label>
                <input
                  style={inputStyle}
                  value={addForm.phone}
                  onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                />
              </div>

              {/* Email */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Email *</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="branch@restaurant.com"
                />
              </div>

              {/* Manager Name */}
              <div>
                <label style={labelStyle}>Manager Name</label>
                <input
                  style={inputStyle}
                  value={addForm.managerName}
                  onChange={(e) => setAddForm((p) => ({ ...p, managerName: e.target.value }))}
                  placeholder="Manager's full name"
                />
              </div>

              {/* Manager Phone */}
              <div>
                <label style={labelStyle}>Manager Phone</label>
                <input
                  style={inputStyle}
                  value={addForm.managerPhone}
                  onChange={(e) => setAddForm((p) => ({ ...p, managerPhone: e.target.value }))}
                  placeholder="+91 9876543210"
                />
              </div>

              {/* Opening Time */}
              <div>
                <label style={labelStyle}>Opening Time</label>
                <input
                  style={inputStyle}
                  type="time"
                  value={addForm.openingTime}
                  onChange={(e) => setAddForm((p) => ({ ...p, openingTime: e.target.value }))}
                />
              </div>

              {/* Closing Time */}
              <div>
                <label style={labelStyle}>Closing Time</label>
                <input
                  style={inputStyle}
                  type="time"
                  value={addForm.closingTime}
                  onChange={(e) => setAddForm((p) => ({ ...p, closingTime: e.target.value }))}
                />
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>Initial Status</label>
                <select
                  style={inputStyle}
                  value={addForm.status}
                  onChange={(e) => setAddForm((p) => ({ ...p, status: e.target.value as any }))}
                >
                  <option value="setup">Setup</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Feature Toggles */}
            <div style={{ marginTop: 18 }}>
              <div style={{ color: TEXT_DIM, fontSize: 11, textTransform: 'uppercase', marginBottom: 10 }}>Features</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {(
                  [
                    { key: 'onlineOrdering', label: 'Online Ordering' },
                    { key: 'tableBooking', label: 'Table Booking' },
                    { key: 'delivery', label: 'Delivery' },
                  ] as const
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      cursor: 'pointer',
                      background: addForm.features[key] ? 'rgba(200,151,42,0.12)' : SURFACE,
                      border: `1px solid ${addForm.features[key] ? GOLD_DIM : BORDER}`,
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 13,
                      color: addForm.features[key] ? GOLD : TEXT_DIM,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={addForm.features[key]}
                      onChange={(e) =>
                        setAddForm((p) => ({
                          ...p,
                          features: { ...p.features, [key]: e.target.checked },
                        }))
                      }
                      style={{ accentColor: GOLD }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button style={btnPrimary} onClick={saveBranch} disabled={saving}>
                {saving ? 'Saving...' : 'Save Branch'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── EDIT MODAL ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editModal && editingBranch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.75)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#111',
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: 28,
                width: '100%',
                maxWidth: 560,
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: TEXT }}>
                Edit — {editingBranch.name}
              </div>

              {msg && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{msg}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {(
                  [
                    { field: 'name', label: 'Branch Name', span: 2 },
                    { field: 'address', label: 'Address', span: 2 },
                    { field: 'city', label: 'City', span: 1 },
                    { field: 'phone', label: 'Phone', span: 1 },
                    { field: 'email', label: 'Email', span: 2, type: 'email' },
                    { field: 'managerName', label: 'Manager Name', span: 1 },
                    { field: 'managerPhone', label: 'Manager Phone', span: 1 },
                    { field: 'openingTime', label: 'Opening Time', span: 1, type: 'time' },
                    { field: 'closingTime', label: 'Closing Time', span: 1, type: 'time' },
                  ] as const
                ).map(({ field, label, span, type }) => (
                  <div key={field} style={{ gridColumn: `span ${span}` }}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      style={inputStyle}
                      type={type || 'text'}
                      value={(editForm as any)[field] || ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))}
                    />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    style={inputStyle}
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as any }))}
                  >
                    <option value="setup">Setup</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Feature toggles */}
              <div style={{ marginTop: 14 }}>
                <div style={{ color: TEXT_DIM, fontSize: 11, textTransform: 'uppercase', marginBottom: 8 }}>Features</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(
                    [
                      { key: 'onlineOrdering', label: 'Online Ordering' },
                      { key: 'tableBooking', label: 'Table Booking' },
                      { key: 'delivery', label: 'Delivery' },
                    ] as const
                  ).map(({ key, label }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: editForm.features[key] ? GOLD : TEXT_DIM }}>
                      <input
                        type="checkbox"
                        checked={editForm.features[key]}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            features: { ...p.features, [key]: e.target.checked },
                          }))
                        }
                        style={{ accentColor: GOLD }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button style={btnPrimary} onClick={saveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button style={btnSecondary} onClick={() => { setEditModal(false); setMsg(''); }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── METRICS MODAL ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {metricsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.75)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setMetricsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#111',
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: 28,
                width: '100%',
                maxWidth: 680,
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {metricsLoading ? (
                <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 32 }}>Loading...</div>
              ) : branchMetrics ? (
                <>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: TEXT }}>
                    {branchMetrics.branch.name} — Metrics (Last 30 Days)
                  </div>
                  <div style={{ color: TEXT_DIM, fontSize: 12, marginBottom: 20 }}>
                    {branchMetrics.branch.city}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
                    {[
                      { label: 'Total Orders', value: fmt(branchMetrics.summary.totalOrders) },
                      { label: 'Total Revenue', value: `₹${fmt(branchMetrics.summary.totalRevenue)}` },
                      { label: 'Avg Order Value', value: `₹${fmt(branchMetrics.summary.avgOrderValue)}` },
                      { label: 'New Customers', value: fmt(branchMetrics.summary.newCustomers) },
                    ].map((kpi) => (
                      <div key={kpi.label} style={{ background: SURFACE, borderRadius: 8, padding: 12, border: `1px solid ${BORDER}` }}>
                        <div style={{ color: TEXT_DIM, fontSize: 10, marginBottom: 4, textTransform: 'uppercase' }}>{kpi.label}</div>
                        <div style={{ color: GOLD, fontSize: 16, fontWeight: 700 }}>{kpi.value}</div>
                      </div>
                    ))}
                  </div>

                  {branchMetrics.metrics.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr>
                          {['Date', 'Orders', 'Revenue', 'Avg Order', 'New Customers'].map((h) => (
                            <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: TEXT_DIM, borderBottom: `1px solid ${BORDER}` }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {branchMetrics.metrics.slice(-14).map((m, i) => (
                          <tr key={i}>
                            <td style={{ padding: '7px 10px', color: TEXT_DIM }}>{new Date(m.date).toLocaleDateString('en-IN')}</td>
                            <td style={{ padding: '7px 10px', color: TEXT }}>{m.orders}</td>
                            <td style={{ padding: '7px 10px', color: GOLD }}>₹{fmt(m.revenue)}</td>
                            <td style={{ padding: '7px 10px', color: TEXT }}>₹{fmt(m.avgOrderValue)}</td>
                            <td style={{ padding: '7px 10px', color: TEXT }}>{m.newCustomers}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 24 }}>No metric data for this branch yet.</div>
                  )}
                </>
              ) : (
                <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 32 }}>No data</div>
              )}
              <button style={{ ...btnSecondary, marginTop: 20 }} onClick={() => setMetricsModal(false)}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
