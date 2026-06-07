'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

type FranchiseeStatus = 'prospect' | 'onboarding' | 'active' | 'terminated';
type RoyaltyType = 'percentage' | 'flat';
type RoyaltyStatus = 'pending' | 'paid';

interface Franchisee {
  _id: string;
  franchiseeName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  city: string;
  address: string;
  status: FranchiseeStatus;
  royaltyType: RoyaltyType;
  royaltyValue: number;
  contractStartDate?: string;
  contractEndDate?: string;
  totalRevenue: number;
  royaltyPaid: number;
  royaltyDue: number;
  notes?: string;
}

interface RoyaltyPayment {
  _id: string;
  franchiseeId: Franchisee | string;
  amount: number;
  periodMonth: string;
  status: RoyaltyStatus;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

interface FranchiseStats {
  totalFranchisees: number;
  active: number;
  totalRevenue: number;
  totalRoyaltyDue: number;
  totalRoyaltyPaid: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API = 'http://localhost:5000/api/franchise';
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

function statusColor(s: FranchiseeStatus): string {
  const colors: Record<FranchiseeStatus, string> = {
    prospect: '#3b82f6',
    onboarding: '#eab308',
    active: '#22c55e',
    terminated: '#ef4444',
  };
  return colors[s] || TEXT_DIM;
}

function royaltyStatusColor(s: RoyaltyStatus): string {
  return s === 'paid' ? '#22c55e' : '#ef4444';
}

function isOverdue(payment: RoyaltyPayment): boolean {
  if (payment.status === 'paid') return false;
  const [year, month] = payment.periodMonth.split('-').map(Number);
  const dueDate = new Date(year, month, 5); // Due by 5th of next month
  return new Date() > dueDate;
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Blank form states ────────────────────────────────────────────────────────

const EMPTY_FRANCHISEE = {
  franchiseeName: '',
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  city: '',
  address: '',
  status: 'prospect' as FranchiseeStatus,
  royaltyType: 'percentage' as RoyaltyType,
  royaltyValue: 0,
  contractStartDate: '',
  contractEndDate: '',
  notes: '',
};

const EMPTY_PROSPECT = {
  franchiseeName: '',
  city: '',
  ownerPhone: '',
  notes: '',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FranchisePage() {
  const [tab, setTab] = useState<'franchisees' | 'royalties' | 'pipeline'>('franchisees');
  const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
  const [stats, setStats] = useState<FranchiseStats | null>(null);
  const [royalties, setRoyalties] = useState<RoyaltyPayment[]>([]);
  const [royaltyTotals, setRoyaltyTotals] = useState({ totalDue: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);
  const [royaltyLoading, setRoyaltyLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingFranchisee, setEditingFranchisee] = useState<Franchisee | null>(null);
  const [royaltyModal, setRoyaltyModal] = useState(false);
  const [viewingFranchisee, setViewingFranchisee] = useState<Franchisee | null>(null);
  const [franchiseeRoyalties, setFranchiseeRoyalties] = useState<RoyaltyPayment[]>([]);
  const [prospectModal, setProspectModal] = useState(false);

  // Forms
  const [addForm, setAddForm] = useState({ ...EMPTY_FRANCHISEE });
  const [editForm, setEditForm] = useState({ ...EMPTY_FRANCHISEE });
  const [prospectForm, setProspectForm] = useState({ ...EMPTY_PROSPECT });

  // ─── Load data ──────────────────────────────────────────────────────────────

  const loadFranchisees = useCallback(async () => {
    try {
      setLoading(true);
      const [fRes, sRes] = await Promise.all([
        fetch(`${API}/franchisees`, { headers: authHeaders() }),
        fetch(`${API}/stats`, { headers: authHeaders() }),
      ]);
      if (fRes.ok) {
        const d = await fRes.json();
        setFranchisees(d.franchisees || []);
      }
      if (sRes.ok) setStats(await sRes.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoyalties = useCallback(async (month: string) => {
    try {
      setRoyaltyLoading(true);
      const res = await fetch(`${API}/royalties?month=${month}`, { headers: authHeaders() });
      if (res.ok) {
        const d = await res.json();
        setRoyalties(d.payments || []);
        setRoyaltyTotals({ totalDue: d.totalDue || 0, totalPaid: d.totalPaid || 0 });
      }
    } catch {
      // silent
    } finally {
      setRoyaltyLoading(false);
    }
  }, []);

  useEffect(() => { loadFranchisees(); }, [loadFranchisees]);
  useEffect(() => { if (tab === 'royalties') loadRoyalties(selectedMonth); }, [tab, selectedMonth, loadRoyalties]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  const createFranchisee = async (form: typeof EMPTY_FRANCHISEE) => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(`${API}/franchisees`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          royaltyValue: Number(form.royaltyValue),
          contractStartDate: form.contractStartDate || undefined,
          contractEndDate: form.contractEndDate || undefined,
        }),
      });
      if (res.ok) {
        setMsg('Franchisee created successfully!');
        setAddForm({ ...EMPTY_FRANCHISEE });
        setAddModal(false);
        await loadFranchisees();
      } else {
        const d = await res.json();
        setMsg(d.error || 'Failed');
      }
    } catch {
      setMsg('Network error');
    } finally {
      setSaving(false);
    }
  };

  const updateFranchisee = async () => {
    if (!editingFranchisee) return;
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(`${API}/franchisees/${editingFranchisee._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          ...editForm,
          royaltyValue: Number(editForm.royaltyValue),
        }),
      });
      if (res.ok) {
        setEditModal(false);
        await loadFranchisees();
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

  const terminateFranchisee = async (id: string) => {
    if (!confirm('Terminate this franchisee? This action cannot be undone easily.')) return;
    try {
      await fetch(`${API}/franchisees/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'terminated' }),
      });
      await loadFranchisees();
    } catch {
      // silent
    }
  };

  const markPaid = async (id: string) => {
    try {
      await fetch(`${API}/royalties/${id}/pay`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({}),
      });
      await loadRoyalties(selectedMonth);
      await loadFranchisees();
    } catch {
      // silent
    }
  };

  const generateRoyalties = async () => {
    if (!confirm(`Generate royalty records for all active franchisees for ${selectedMonth}?`)) return;
    setSaving(true);
    try {
      // Create royalty records for each active franchisee
      const activeFranchisees = franchisees.filter((f) => f.status === 'active');
      for (const f of activeFranchisees) {
        const royaltyAmt =
          f.royaltyType === 'percentage'
            ? (f.totalRevenue * f.royaltyValue) / 100
            : f.royaltyValue;

        await fetch(`${API}/royalties`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            franchiseeId: f._id,
            amount: royaltyAmt,
            periodMonth: selectedMonth,
            status: 'pending',
          }),
        });
      }
      await loadRoyalties(selectedMonth);
      await loadFranchisees();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const openRoyaltyView = async (f: Franchisee) => {
    setViewingFranchisee(f);
    try {
      const res = await fetch(`${API}/royalties?franchiseeId=${f._id}`, { headers: authHeaders() });
      if (res.ok) {
        const d = await res.json();
        setFranchiseeRoyalties(d.payments || []);
      }
    } catch {
      // silent
    }
    setRoyaltyModal(true);
  };

  const openEdit = (f: Franchisee) => {
    setEditingFranchisee(f);
    setEditForm({
      franchiseeName: f.franchiseeName,
      ownerName: f.ownerName,
      ownerPhone: f.ownerPhone,
      ownerEmail: f.ownerEmail,
      city: f.city,
      address: f.address,
      status: f.status,
      royaltyType: f.royaltyType,
      royaltyValue: f.royaltyValue,
      contractStartDate: f.contractStartDate ? f.contractStartDate.split('T')[0] : '',
      contractEndDate: f.contractEndDate ? f.contractEndDate.split('T')[0] : '',
      notes: f.notes || '',
    });
    setMsg('');
    setEditModal(true);
  };

  const addProspect = async () => {
    await createFranchisee({
      ...EMPTY_FRANCHISEE,
      franchiseeName: prospectForm.franchiseeName,
      city: prospectForm.city,
      ownerPhone: prospectForm.ownerPhone,
      ownerName: '',
      ownerEmail: '',
      address: '',
      notes: prospectForm.notes,
      status: 'prospect',
    });
    setProspectForm({ ...EMPTY_PROSPECT });
    setProspectModal(false);
  };

  // ─── Derived ────────────────────────────────────────────────────────────────

  const prospects = franchisees.filter((f) => f.status === 'prospect');
  const onboarding = franchisees.filter((f) => f.status === 'onboarding');
  const active = franchisees.filter((f) => f.status === 'active');
  const terminated = franchisees.filter((f) => f.status === 'terminated');
  const pipelineItems = [...prospects, ...onboarding, ...active];
  const cities = [...new Set(franchisees.filter((f) => f.status === 'active').map((f) => f.city))];

  // ─── Styles ────────────────────────────────────────────────────────────────

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: BG,
    color: TEXT,
    fontFamily: "'Inter', sans-serif",
    padding: '24px 28px',
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
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
  };

  const statusBadge = (s: FranchiseeStatus): React.CSSProperties => ({
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 20,
    background: `${statusColor(s)}22`,
    color: statusColor(s),
    border: `1px solid ${statusColor(s)}44`,
    textTransform: 'capitalize',
    fontWeight: 600,
  });

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '9px 12px',
    color: TEXT_DIM,
    fontSize: 11,
    textTransform: 'uppercase',
    borderBottom: `1px solid ${BORDER}`,
    fontWeight: 500,
  };

  const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderBottom: `1px solid #1a1a1a`,
    fontSize: 13,
  };

  // ─── Franchise Form Fields ────────────────────────────────────────────────

  const FranchiseeFormFields = ({
    form,
    setForm,
  }: {
    form: typeof EMPTY_FRANCHISEE;
    setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FRANCHISEE>>;
  }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ gridColumn: 'span 2' }}>
        <label style={labelStyle}>Franchise Name *</label>
        <input
          style={inputStyle}
          value={form.franchiseeName}
          onChange={(e) => setForm((p) => ({ ...p, franchiseeName: e.target.value }))}
          placeholder="e.g. Sonu's Burger Hub"
        />
      </div>
      <div>
        <label style={labelStyle}>Owner Name *</label>
        <input
          style={inputStyle}
          value={form.ownerName}
          onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
        />
      </div>
      <div>
        <label style={labelStyle}>Owner Phone *</label>
        <input
          style={inputStyle}
          value={form.ownerPhone}
          onChange={(e) => setForm((p) => ({ ...p, ownerPhone: e.target.value }))}
        />
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <label style={labelStyle}>Owner Email *</label>
        <input
          style={inputStyle}
          type="email"
          value={form.ownerEmail}
          onChange={(e) => setForm((p) => ({ ...p, ownerEmail: e.target.value }))}
        />
      </div>
      <div>
        <label style={labelStyle}>City *</label>
        <input
          style={inputStyle}
          value={form.city}
          onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
        />
      </div>
      <div>
        <label style={labelStyle}>Status</label>
        <select
          style={inputStyle}
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as FranchiseeStatus }))}
        >
          <option value="prospect">Prospect</option>
          <option value="onboarding">Onboarding</option>
          <option value="active">Active</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <label style={labelStyle}>Address *</label>
        <input
          style={inputStyle}
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
        />
      </div>
      <div>
        <label style={labelStyle}>Royalty Type</label>
        <select
          style={inputStyle}
          value={form.royaltyType}
          onChange={(e) => setForm((p) => ({ ...p, royaltyType: e.target.value as RoyaltyType }))}
        >
          <option value="percentage">Percentage (%)</option>
          <option value="flat">Flat (₹)</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Royalty Value ({form.royaltyType === 'percentage' ? '%' : '₹'})</label>
        <input
          style={inputStyle}
          type="number"
          value={form.royaltyValue}
          onChange={(e) => setForm((p) => ({ ...p, royaltyValue: Number(e.target.value) }))}
        />
      </div>
      <div>
        <label style={labelStyle}>Contract Start</label>
        <input
          style={inputStyle}
          type="date"
          value={form.contractStartDate}
          onChange={(e) => setForm((p) => ({ ...p, contractStartDate: e.target.value }))}
        />
      </div>
      <div>
        <label style={labelStyle}>Contract End</label>
        <input
          style={inputStyle}
          type="date"
          value={form.contractEndDate}
          onChange={(e) => setForm((p) => ({ ...p, contractEndDate: e.target.value }))}
        />
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <label style={labelStyle}>Notes</label>
        <textarea
          style={{ ...inputStyle, height: 70, resize: 'vertical' }}
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        />
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0 }}>
          Franchise Management
        </h1>
        <p style={{ color: TEXT_DIM, fontSize: 13, margin: '4px 0 0' }}>
          Manage franchisees, royalties, and expansion pipeline
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['franchisees', 'royalties', 'pipeline'] as const).map((t) => (
          <button key={t} style={tabBtn(tab === t)} onClick={() => setTab(t)}>
            {t === 'franchisees' ? 'Franchisees' : t === 'royalties' ? 'Royalty Tracking' : 'Expansion Pipeline'}
          </button>
        ))}
      </div>

      {/* ── TAB 1: FRANCHISEES ──────────────────────────────────────────────── */}
      {tab === 'franchisees' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total', value: stats?.totalFranchisees ?? '—', color: TEXT },
              { label: 'Active', value: stats?.active ?? '—', color: '#22c55e' },
              { label: 'Onboarding', value: onboarding.length, color: '#eab308' },
              { label: 'Terminated', value: terminated.length, color: '#ef4444' },
              { label: 'Total Revenue', value: stats ? `₹${fmt(stats.totalRevenue)}` : '—', color: GOLD },
            ].map((item) => (
              <div key={item.label} style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ color: TEXT_DIM, fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>{item.label}</div>
                <div style={{ color: item.color, fontSize: 20, fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Add button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button style={btnPrimary} onClick={() => { setAddForm({ ...EMPTY_FRANCHISEE }); setMsg(''); setAddModal(true); }}>
              + Add Franchisee
            </button>
          </div>

          {/* Table */}
          <div style={{ ...cardStyle, overflowX: 'auto' }}>
            {loading ? (
              <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 40 }}>Loading...</div>
            ) : franchisees.length === 0 ? (
              <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 40 }}>No franchisees yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Franchise', 'Owner', 'City', 'Status', 'Royalty', 'Contract', 'Total Revenue', 'Royalty Due', 'Actions'].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {franchisees.map((f) => (
                    <tr key={f._id} style={{ background: f.status === 'terminated' ? '#ef444408' : 'transparent' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: TEXT }}>{f.franchiseeName}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ color: TEXT }}>{f.ownerName}</div>
                        <div style={{ color: TEXT_DIM, fontSize: 11 }}>{f.ownerPhone}</div>
                      </td>
                      <td style={{ ...tdStyle, color: TEXT_DIM }}>{f.city}</td>
                      <td style={tdStyle}>
                        <span style={statusBadge(f.status)}>{f.status}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: GOLD, fontWeight: 600 }}>
                          {f.royaltyValue}{f.royaltyType === 'percentage' ? '%' : '₹'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: TEXT_DIM, fontSize: 11 }}>
                        {f.contractStartDate ? new Date(f.contractStartDate).toLocaleDateString('en-IN') : '—'}
                        {f.contractEndDate ? ` – ${new Date(f.contractEndDate).toLocaleDateString('en-IN')}` : ''}
                      </td>
                      <td style={{ ...tdStyle, color: GOLD, fontWeight: 600 }}>₹{fmt(f.totalRevenue)}</td>
                      <td style={{ ...tdStyle, color: f.royaltyDue > 0 ? '#ef4444' : TEXT_DIM, fontWeight: f.royaltyDue > 0 ? 600 : 400 }}>
                        {f.royaltyDue > 0 ? `₹${fmt(f.royaltyDue)}` : '—'}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button style={{ ...btnSecondary, padding: '5px 10px' }} onClick={() => openEdit(f)}>Edit</button>
                          <button
                            style={{ ...btnSecondary, padding: '5px 10px', color: GOLD, borderColor: GOLD_DIM }}
                            onClick={() => openRoyaltyView(f)}
                          >
                            Royalties
                          </button>
                          {f.status !== 'terminated' && (
                            <button
                              style={{ ...btnSecondary, padding: '5px 10px', color: '#ef4444', borderColor: '#ef444444' }}
                              onClick={() => terminateFranchisee(f._id)}
                            >
                              Terminate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}

      {/* ── TAB 2: ROYALTY TRACKING ─────────────────────────────────────────── */}
      {tab === 'royalties' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Month picker + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
              <label style={labelStyle}>Period Month</label>
              <input
                style={{ ...inputStyle, width: 160 }}
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <button
              style={{ ...btnPrimary, alignSelf: 'flex-end', marginBottom: 0 }}
              onClick={generateRoyalties}
              disabled={saving}
            >
              {saving ? 'Generating...' : 'Generate Royalties'}
            </button>
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ ...cardStyle, flex: 1, textAlign: 'center' }}>
              <div style={{ color: TEXT_DIM, fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>Total Due</div>
              <div style={{ color: '#ef4444', fontSize: 20, fontWeight: 700 }}>₹{fmt(royaltyTotals.totalDue)}</div>
            </div>
            <div style={{ ...cardStyle, flex: 1, textAlign: 'center' }}>
              <div style={{ color: TEXT_DIM, fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>Total Paid</div>
              <div style={{ color: '#22c55e', fontSize: 20, fontWeight: 700 }}>₹{fmt(royaltyTotals.totalPaid)}</div>
            </div>
          </div>

          {/* Table */}
          <div style={{ ...cardStyle, overflowX: 'auto' }}>
            {royaltyLoading ? (
              <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 40 }}>Loading...</div>
            ) : royalties.length === 0 ? (
              <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 40 }}>
                No royalty records for {selectedMonth}. Click "Generate Royalties" to create them.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Franchisee', 'Period', 'Amount', 'Status', 'Paid At', 'Action'].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {royalties.map((r) => {
                    const overdue = isOverdue(r);
                    const franchiseeName =
                      typeof r.franchiseeId === 'object' && r.franchiseeId !== null
                        ? (r.franchiseeId as Franchisee).franchiseeName
                        : String(r.franchiseeId);

                    return (
                      <tr
                        key={r._id}
                        style={{ background: overdue ? '#ef444410' : 'transparent' }}
                      >
                        <td style={{ ...tdStyle, fontWeight: 600, color: overdue ? '#ef4444' : TEXT }}>
                          {franchiseeName}
                          {overdue && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: '#ef4444', background: '#ef444422', padding: '1px 6px', borderRadius: 4 }}>
                              OVERDUE
                            </span>
                          )}
                        </td>
                        <td style={{ ...tdStyle, color: TEXT_DIM }}>{r.periodMonth}</td>
                        <td style={{ ...tdStyle, color: GOLD, fontWeight: 600 }}>₹{fmt(r.amount)}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              fontSize: 11,
                              padding: '3px 10px',
                              borderRadius: 20,
                              background: `${royaltyStatusColor(r.status)}22`,
                              color: royaltyStatusColor(r.status),
                              border: `1px solid ${royaltyStatusColor(r.status)}44`,
                              textTransform: 'capitalize',
                              fontWeight: 600,
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: TEXT_DIM, fontSize: 12 }}>
                          {r.paidAt ? new Date(r.paidAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td style={tdStyle}>
                          {r.status === 'pending' && (
                            <button
                              style={{ ...btnPrimary, padding: '6px 14px', fontSize: 12 }}
                              onClick={() => markPaid(r._id)}
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}

      {/* ── TAB 3: EXPANSION PIPELINE ────────────────────────────────────────── */}
      {tab === 'pipeline' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Add Prospect */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button style={btnPrimary} onClick={() => { setProspectForm({ ...EMPTY_PROSPECT }); setProspectModal(true); }}>
              + Add Prospect
            </button>
          </div>

          {/* Kanban */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
            {(
              [
                { label: 'Prospect', status: 'prospect' as const, items: prospects, color: '#3b82f6' },
                { label: 'Due Diligence', status: 'onboarding' as const, items: onboarding.slice(0, Math.ceil(onboarding.length / 2)), color: '#eab308' },
                { label: 'Onboarding', status: 'onboarding' as const, items: onboarding.slice(Math.ceil(onboarding.length / 2)), color: '#f97316' },
                { label: 'Active', status: 'active' as const, items: active, color: '#22c55e' },
              ]
            ).map((col) => (
              <div key={col.label}>
                {/* Column header */}
                <div
                  style={{
                    background: `${col.color}18`,
                    border: `1px solid ${col.color}44`,
                    borderRadius: '10px 10px 0 0',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: col.color, fontWeight: 600, fontSize: 13 }}>{col.label}</span>
                  <span
                    style={{
                      background: col.color,
                      color: '#000',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {col.items.length}
                  </span>
                </div>

                {/* Cards */}
                <div
                  style={{
                    background: `${col.color}08`,
                    border: `1px solid ${col.color}22`,
                    borderTop: 'none',
                    borderRadius: '0 0 10px 10px',
                    minHeight: 200,
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {col.items.length === 0 && (
                    <div style={{ color: TEXT_DIM, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>Empty</div>
                  )}
                  {col.items.map((f) => (
                    <motion.div
                      key={f._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        background: SURFACE,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 8,
                        padding: 12,
                        cursor: 'pointer',
                      }}
                      whileHover={{ borderColor: col.color, scale: 1.02 }}
                      onClick={() => openEdit(f)}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, color: TEXT, marginBottom: 4 }}>{f.franchiseeName}</div>
                      <div style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 2 }}>
                        {f.ownerName || f.ownerPhone}
                      </div>
                      <div style={{ fontSize: 11, color: col.color }}>{f.city}</div>
                      {f.notes && (
                        <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 6, fontStyle: 'italic' }}>
                          {f.notes.substring(0, 60)}{f.notes.length > 60 ? '...' : ''}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Active cities map */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12 }}>
              Cities with Active / Planned Franchises
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {cities.length === 0 && (
                <span style={{ color: TEXT_DIM, fontSize: 13 }}>No active franchises yet.</span>
              )}
              {cities.map((city) => {
                const count = franchisees.filter((f) => f.city === city && f.status === 'active').length;
                return (
                  <div
                    key={city}
                    style={{
                      background: 'rgba(200,151,42,0.1)',
                      border: `1px solid ${GOLD_DIM}`,
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: GOLD, fontWeight: 600 }}>{city}</span>
                    <span style={{ color: TEXT_DIM, marginLeft: 6 }}>{count} active</span>
                  </div>
                );
              })}
              {/* Planned/prospect cities */}
              {[...new Set(franchisees.filter((f) => f.status !== 'active' && f.status !== 'terminated').map((f) => f.city))]
                .filter((c) => !cities.includes(c))
                .map((city) => (
                  <div
                    key={city}
                    style={{
                      background: 'rgba(59,130,246,0.08)',
                      border: `1px solid #3b82f644`,
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>{city}</span>
                    <span style={{ color: TEXT_DIM, marginLeft: 6 }}>planned</span>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── ADD FRANCHISEE MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {addModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.78)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setAddModal(false)}
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
                maxWidth: 580,
                maxHeight: '88vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: TEXT }}>Add Franchisee</div>
              {msg && <div style={{ color: msg.includes('success') ? '#22c55e' : '#ef4444', fontSize: 12, marginBottom: 10 }}>{msg}</div>}
              <FranchiseeFormFields form={addForm} setForm={setAddForm} />
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button style={btnPrimary} onClick={() => createFranchisee(addForm)} disabled={saving}>
                  {saving ? 'Saving...' : 'Create Franchisee'}
                </button>
                <button style={btnSecondary} onClick={() => { setAddModal(false); setMsg(''); }}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDIT FRANCHISEE MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {editModal && editingFranchisee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.78)',
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
                maxWidth: 580,
                maxHeight: '88vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: TEXT }}>
                Edit — {editingFranchisee.franchiseeName}
              </div>
              {msg && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 10 }}>{msg}</div>}
              <FranchiseeFormFields form={editForm} setForm={setEditForm} />
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button style={btnPrimary} onClick={updateFranchisee} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button style={btnSecondary} onClick={() => { setEditModal(false); setMsg(''); }}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ROYALTY VIEW MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {royaltyModal && viewingFranchisee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.78)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setRoyaltyModal(false)}
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
                maxWidth: 620,
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: TEXT }}>
                {viewingFranchisee.franchiseeName}
              </div>
              <div style={{ color: TEXT_DIM, fontSize: 12, marginBottom: 20 }}>
                All Royalty Payments — {viewingFranchisee.ownerName}
              </div>

              {/* Royalty summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Total Revenue', value: `₹${fmt(viewingFranchisee.totalRevenue)}`, color: GOLD },
                  { label: 'Royalty Paid', value: `₹${fmt(viewingFranchisee.royaltyPaid)}`, color: '#22c55e' },
                  { label: 'Royalty Due', value: `₹${fmt(viewingFranchisee.royaltyDue)}`, color: viewingFranchisee.royaltyDue > 0 ? '#ef4444' : TEXT_DIM },
                ].map((kpi) => (
                  <div key={kpi.label} style={{ background: SURFACE, borderRadius: 8, padding: 12, border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    <div style={{ color: TEXT_DIM, fontSize: 10, textTransform: 'uppercase', marginBottom: 4 }}>{kpi.label}</div>
                    <div style={{ color: kpi.color, fontSize: 16, fontWeight: 700 }}>{kpi.value}</div>
                  </div>
                ))}
              </div>

              {franchiseeRoyalties.length === 0 ? (
                <div style={{ color: TEXT_DIM, textAlign: 'center', padding: 24 }}>No royalty records found.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['Period', 'Amount', 'Status', 'Paid At'].map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {franchiseeRoyalties.map((r) => (
                      <tr key={r._id}>
                        <td style={{ ...tdStyle, color: TEXT }}>{r.periodMonth}</td>
                        <td style={{ ...tdStyle, color: GOLD, fontWeight: 600 }}>₹{fmt(r.amount)}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 12,
                              background: `${royaltyStatusColor(r.status)}22`,
                              color: royaltyStatusColor(r.status),
                              border: `1px solid ${royaltyStatusColor(r.status)}44`,
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: TEXT_DIM, fontSize: 12 }}>
                          {r.paidAt ? new Date(r.paidAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <button style={{ ...btnSecondary, marginTop: 20 }} onClick={() => setRoyaltyModal(false)}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADD PROSPECT MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {prospectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.78)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setProspectModal(false)}
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
                maxWidth: 420,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: TEXT }}>
                Quick Add Prospect
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Franchise / Outlet Name *</label>
                  <input
                    style={inputStyle}
                    value={prospectForm.franchiseeName}
                    onChange={(e) => setProspectForm((p) => ({ ...p, franchiseeName: e.target.value }))}
                    placeholder="Name of the outlet"
                  />
                </div>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input
                    style={inputStyle}
                    value={prospectForm.city}
                    onChange={(e) => setProspectForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Owner Phone</label>
                  <input
                    style={inputStyle}
                    value={prospectForm.ownerPhone}
                    onChange={(e) => setProspectForm((p) => ({ ...p, ownerPhone: e.target.value }))}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Notes</label>
                  <textarea
                    style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                    value={prospectForm.notes}
                    onChange={(e) => setProspectForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Initial conversation notes..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button style={btnPrimary} onClick={addProspect} disabled={saving}>
                  {saving ? 'Adding...' : 'Add to Pipeline'}
                </button>
                <button style={btnSecondary} onClick={() => setProspectModal(false)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
