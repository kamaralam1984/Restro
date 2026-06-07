'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Affiliate {
  _id: string;
  restaurantId: string;
  name: string;
  email: string;
  phone: string;
  code: string;
  commissionType: 'percentage' | 'flat';
  commissionValue: number;
  totalEarned: number;
  totalOrders: number;
  status: 'active' | 'inactive' | 'pending';
  payoutMethod: string;
  payoutDetails: string;
  notes?: string;
  createdAt: string;
}

interface Conversion {
  _id: string;
  affiliateId: { _id: string; name: string; code: string; email?: string };
  orderId: { _id: string; orderNumber?: string; total?: number } | string;
  orderAmount: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
}

interface AffiliateStats {
  totalAffiliates: number;
  totalEarned: number;
  totalOrders: number;
  pendingPayout: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api/affiliate';
const GOLD = '#c8972a';
const BG = '#080808';
const SURFACE = '#141414';
const SURFACE2 = '#1a1a1a';
const BORDER = 'rgba(200,151,42,0.18)';

// ── Helpers ────────────────────────────────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function formatRupee(n: number) {
  return '₹' + (n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getSlug() {
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  return admin.slug || admin.restaurantSlug || '';
}

// ── Shared UI ──────────────────────────────────────────────────────────────────
function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 22px', borderRadius: 8,
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

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 14px', borderRadius: 20,
        border: active ? `1px solid ${GOLD}` : '1px solid rgba(255,255,255,0.1)',
        background: active ? GOLD : 'transparent',
        color: active ? '#000' : 'rgba(255,255,255,0.6)',
        fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    active: { color: '#22c55e', label: 'Active' },
    inactive: { color: '#ef4444', label: 'Inactive' },
    pending: { color: '#f59e0b', label: 'Pending' },
    approved: { color: '#22c55e', label: 'Approved' },
    paid: { color: '#60a5fa', label: 'Paid' },
  };
  const s = map[status] || { color: '#9ca3af', label: status };
  return (
    <span style={{ background: s.color + '22', color: s.color, border: `1px solid ${s.color}55`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
      {s.label}
    </span>
  );
}

function SummaryCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 12, padding: '20px 24px', flex: 1, minWidth: 160 }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ color: accent || GOLD, fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: SURFACE2, border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 8,
          color: '#fff', fontSize: 13, padding: '9px 12px', outline: 'none', fontFamily: 'inherit',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = GOLD + '88')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: SURFACE2, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
          color: '#fff', fontSize: 13, padding: '9px 12px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Add/Edit Affiliate Modal ───────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', email: '', phone: '', code: '',
  commissionType: 'percentage', commissionValue: '',
  payoutMethod: '', payoutDetails: '', notes: '',
};

function AffiliateModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Affiliate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          email: initial.email,
          phone: initial.phone,
          code: initial.code,
          commissionType: initial.commissionType,
          commissionValue: String(initial.commissionValue),
          payoutMethod: initial.payoutMethod,
          payoutDetails: initial.payoutDetails,
          notes: initial.notes || '',
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.phone || !form.code || !form.commissionValue || !form.payoutMethod || !form.payoutDetails) {
      setError('Please fill all required fields');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = { ...form, commissionValue: parseFloat(form.commissionValue) };
      const url = initial ? `${API_BASE}/affiliates/${initial._id}` : `${API_BASE}/affiliates`;
      const method = initial ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Failed to save'); return; }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ color: GOLD, margin: 0, fontSize: 17, fontWeight: 700 }}>
            {initial ? 'Edit Affiliate' : 'Add Affiliate'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input label="Name *" value={form.name} onChange={(v) => set('name', v)} placeholder="Affiliate full name" />
          <Input label="Email *" type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="affiliate@email.com" />
          <Input label="Phone *" value={form.phone} onChange={(v) => set('phone', v)} placeholder="+91 9876543210" />
          <Input label="Referral Code *" value={form.code} onChange={(v) => set('code', v.toUpperCase())} placeholder="AFFFIRST10" />
          <Select
            label="Commission Type *"
            value={form.commissionType}
            onChange={(v) => set('commissionType', v)}
            options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'flat', label: 'Flat Amount (₹)' }]}
          />
          <Input
            label={`Commission Value * (${form.commissionType === 'percentage' ? '%' : '₹'})`}
            type="number"
            value={form.commissionValue}
            onChange={(v) => set('commissionValue', v)}
            placeholder={form.commissionType === 'percentage' ? '10' : '50'}
          />
          <Input label="Payout Method *" value={form.payoutMethod} onChange={(v) => set('payoutMethod', v)} placeholder="UPI / Bank / PayPal" />
          <Input label="Payout Details *" value={form.payoutDetails} onChange={(v) => set('payoutDetails', v)} placeholder="UPI ID or account details" />
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Notes</div>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Optional notes about this affiliate..."
            style={{ width: '100%', minHeight: 70, background: SURFACE2, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: 13, padding: '9px 12px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        {error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 12, padding: '8px 12px', background: '#ef444411', borderRadius: 6 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: GOLD, color: '#000', fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving…' : initial ? 'Update Affiliate' : 'Add Affiliate'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AffiliatesPage() {
  const [activeTab, setActiveTab] = useState<'affiliates' | 'conversions' | 'payouts'>('affiliates');

  // Affiliates state
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editAffiliate, setEditAffiliate] = useState<Affiliate | null>(null);
  const [affLoading, setAffLoading] = useState(false);

  // Conversions state
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [convFilter, setConvFilter] = useState('all');
  const [convLoading, setConvLoading] = useState(false);
  const [totalPending, setTotalPending] = useState(0);

  // Stats
  const [stats, setStats] = useState<AffiliateStats | null>(null);

  const slug = getSlug();

  // ── Data loaders ──────────────────────────────────────────────────────────
  const loadAffiliates = useCallback(async () => {
    setAffLoading(true);
    try {
      const r = await fetch(`${API_BASE}/affiliates`, { headers: authHeaders() });
      const data = await r.json();
      setAffiliates(data.affiliates || []);
    } catch (e) { console.error(e); }
    finally { setAffLoading(false); }
  }, []);

  const loadConversions = useCallback(async () => {
    setConvLoading(true);
    try {
      const params = convFilter !== 'all' ? `?status=${convFilter}` : '';
      const r = await fetch(`${API_BASE}/affiliates/conversions${params}`, { headers: authHeaders() });
      const data = await r.json();
      setConversions(data.conversions || []);
      setTotalPending(data.totalPending || 0);
    } catch (e) { console.error(e); }
    finally { setConvLoading(false); }
  }, [convFilter]);

  const loadStats = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/affiliates/stats`, { headers: authHeaders() });
      const data = await r.json();
      setStats(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (activeTab === 'affiliates') { loadAffiliates(); loadStats(); }
    if (activeTab === 'conversions') loadConversions();
    if (activeTab === 'payouts') { loadAffiliates(); loadStats(); loadConversions(); }
  }, [activeTab, convFilter, loadAffiliates, loadConversions, loadStats]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const deleteAffiliate = async (id: string) => {
    if (!confirm('Delete this affiliate? This will also remove their conversions.')) return;
    await fetch(`${API_BASE}/affiliates/${id}`, { method: 'DELETE', headers: authHeaders() });
    loadAffiliates();
  };

  const toggleStatus = async (aff: Affiliate) => {
    const newStatus = aff.status === 'active' ? 'inactive' : 'active';
    await fetch(`${API_BASE}/affiliates/${aff._id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: newStatus }),
    });
    loadAffiliates();
  };

  const updateConversionStatus = async (id: string, status: 'approved' | 'paid') => {
    await fetch(`${API_BASE}/affiliates/conversions/${id}/status`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }),
    });
    loadConversions();
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const referralLink = (code: string) => `http://localhost:3010/r/${slug}?aff=${code}`;

  // ── PAYOUTS computed ──────────────────────────────────────────────────────
  const payoutsByAffiliate = affiliates.map((aff) => {
    const affConversions = conversions.filter((c) =>
      typeof c.affiliateId === 'object' && c.affiliateId._id === aff._id
    );
    const totalPaid = affConversions.filter((c) => c.status === 'paid').reduce((s, c) => s + c.commissionAmount, 0);
    const pending = affConversions.filter((c) => c.status !== 'paid').reduce((s, c) => s + c.commissionAmount, 0);
    return { ...aff, paidOut: totalPaid, pendingAmount: pending };
  });

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: GOLD, letterSpacing: -0.5 }}>
          Affiliate Program
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', fontSize: 13 }}>
          Manage affiliates, track conversions, and handle payouts
        </p>
      </div>

      {/* Summary stats bar */}
      {stats && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          <SummaryCard label="Total Affiliates" value={String(stats.totalAffiliates)} sub="registered" />
          <SummaryCard label="Total Earned" value={formatRupee(stats.totalEarned)} sub="all time" />
          <SummaryCard label="Total Orders" value={String(stats.totalOrders)} sub="via affiliates" />
          <SummaryCard label="Pending Payout" value={formatRupee(stats.pendingPayout)} sub="to be paid" accent="#f59e0b" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        <TabButton label="Affiliates" active={activeTab === 'affiliates'} onClick={() => setActiveTab('affiliates')} />
        <TabButton label="Conversions" active={activeTab === 'conversions'} onClick={() => setActiveTab('conversions')} />
        <TabButton label="Payouts" active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} />
      </div>

      <AnimatePresence mode="wait">

        {/* ── TAB 1: Affiliates ─────────────────────────────────────────────── */}
        {activeTab === 'affiliates' && (
          <motion.div key="affiliates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button
                onClick={() => { setEditAffiliate(null); setShowModal(true); }}
                style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: GOLD, color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                + Add Affiliate
              </button>
            </div>

            {affLoading ? (
              <div style={{ color: GOLD, textAlign: 'center', padding: 48 }}>Loading…</div>
            ) : affiliates.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60, fontSize: 15 }}>
                No affiliates yet. Add your first affiliate to get started.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {affiliates.map((aff) => {
                  const link = referralLink(aff.code);
                  const [copiedLink, setCopiedLink] = useState(false);
                  const [copiedCode, setCopiedCode] = useState(false);

                  return (
                    <motion.div
                      key={aff._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 12, padding: 20 }}
                    >
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{aff.name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>{aff.email}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{aff.phone}</div>
                        </div>
                        <StatusBadge status={aff.status} />
                      </div>

                      {/* Code */}
                      <div style={{ background: SURFACE2, borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>Referral Code</div>
                          <div style={{ color: GOLD, fontWeight: 800, fontSize: 16, letterSpacing: 1.5 }}>{aff.code}</div>
                        </div>
                        <button
                          onClick={() => { copyCode(aff.code); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }}
                          style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${GOLD}44`, background: 'transparent', color: GOLD, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                        >
                          {copiedCode ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      {/* Stats row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: GOLD, fontWeight: 700, fontSize: 14 }}>{formatRupee(aff.totalEarned)}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6 }}>Earned</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 14 }}>{aff.totalOrders}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6 }}>Orders</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14 }}>
                            {aff.commissionType === 'percentage' ? `${aff.commissionValue}%` : formatRupee(aff.commissionValue)}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6 }}>Commission</div>
                        </div>
                      </div>

                      {/* Referral link */}
                      <div
                        onClick={() => { copyCode(link); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }}
                        style={{ background: SURFACE2, borderRadius: 6, padding: '7px 10px', color: copiedLink ? '#22c55e' : 'rgba(255,255,255,0.3)', fontSize: 11, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 14, transition: 'color 0.2s' }}
                        title="Click to copy referral link"
                      >
                        {copiedLink ? 'Link Copied!' : link}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => { setEditAffiliate(aff); setShowModal(true); }}
                          style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: `1px solid ${GOLD}44`, background: 'transparent', color: GOLD, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleStatus(aff)}
                          style={{
                            flex: 1, padding: '7px 0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            border: aff.status === 'active' ? '1px solid #ef444444' : '1px solid #22c55e44',
                            background: aff.status === 'active' ? '#ef444411' : '#22c55e11',
                            color: aff.status === 'active' ? '#ef4444' : '#22c55e',
                          }}
                        >
                          {aff.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteAffiliate(aff._id)}
                          style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid rgba(107,114,128,0.3)', background: 'transparent', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Del
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB 2: Conversions ────────────────────────────────────────────── */}
        {activeTab === 'conversions' && (
          <motion.div key="conversions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Pending payout alert */}
            {totalPending > 0 && (
              <div style={{ background: 'rgba(200,151,42,0.1)', border: `1px solid ${GOLD}44`, borderRadius: 10, padding: '12px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Total pending payout for visible results:</span>
                <span style={{ color: GOLD, fontWeight: 800, fontSize: 20 }}>{formatRupee(totalPending)}</span>
              </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {['all', 'pending', 'approved', 'paid'].map((s) => (
                <FilterTab
                  key={s}
                  label={s.charAt(0).toUpperCase() + s.slice(1)}
                  active={convFilter === s}
                  onClick={() => setConvFilter(s)}
                />
              ))}
            </div>

            {convLoading ? (
              <div style={{ color: GOLD, textAlign: 'center', padding: 48 }}>Loading…</div>
            ) : conversions.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60, fontSize: 15 }}>
                No conversions found
              </div>
            ) : (
              <div style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Affiliate', 'Order ID', 'Order Amount', 'Commission', 'Status', 'Date', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {conversions.map((conv, idx) => {
                      const affName = typeof conv.affiliateId === 'object' ? conv.affiliateId.name : '—';
                      const affCode = typeof conv.affiliateId === 'object' ? conv.affiliateId.code : '';
                      const orderId = typeof conv.orderId === 'object' ? (conv.orderId.orderNumber || conv.orderId._id?.slice(-6)) : String(conv.orderId).slice(-6);

                      return (
                        <tr
                          key={conv._id}
                          style={{ borderBottom: idx < conversions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.04)')}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{affName}</div>
                            {affCode && <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, marginTop: 1 }}>{affCode}</div>}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }}>
                            #{orderId}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600, fontSize: 13 }}>
                            {formatRupee(conv.orderAmount)}
                          </td>
                          <td style={{ padding: '12px 16px', color: GOLD, fontWeight: 700, fontSize: 14 }}>
                            {formatRupee(conv.commissionAmount)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <StatusBadge status={conv.status} />
                          </td>
                          <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12, whiteSpace: 'nowrap' }}>
                            {fmtDate(conv.createdAt)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 5 }}>
                              {conv.status === 'pending' && (
                                <button
                                  onClick={() => updateConversionStatus(conv._id, 'approved')}
                                  style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #22c55e66', background: '#22c55e11', color: '#22c55e', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Approve
                                </button>
                              )}
                              {(conv.status === 'pending' || conv.status === 'approved') && (
                                <button
                                  onClick={() => updateConversionStatus(conv._id, 'paid')}
                                  style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #60a5fa55', background: '#60a5fa11', color: '#60a5fa', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Mark Paid
                                </button>
                              )}
                              {conv.status === 'paid' && (
                                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>Paid</span>
                              )}
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
        )}

        {/* ── TAB 3: Payouts ────────────────────────────────────────────────── */}
        {activeTab === 'payouts' && (
          <motion.div key="payouts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Summary cards */}
            {stats && (
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
                <SummaryCard label="Total Earned" value={formatRupee(stats.totalEarned)} sub="commissions generated" />
                <SummaryCard
                  label="Total Paid"
                  value={formatRupee(stats.totalEarned - stats.pendingPayout)}
                  sub="paid out to affiliates"
                  accent="#22c55e"
                />
                <SummaryCard label="Pending Payout" value={formatRupee(stats.pendingPayout)} sub="awaiting payment" accent="#f59e0b" />
              </div>
            )}

            {/* Affiliate payout list */}
            <div style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontWeight: 700, color: GOLD, fontSize: 14 }}>
                Affiliate Payout Summary
              </div>
              {payoutsByAffiliate.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40, fontSize: 14 }}>No affiliates yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Affiliate', 'Payout Method', 'Total Earned', 'Paid Out', 'Pending', 'Action'].map((h) => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payoutsByAffiliate.map((aff, idx) => (
                      <tr
                        key={aff._id}
                        style={{ borderBottom: idx < payoutsByAffiliate.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.04)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{aff.name}</div>
                          <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, marginTop: 1 }}>{aff.code}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{aff.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: '#fff', fontSize: 13 }}>{aff.payoutMethod}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {aff.payoutDetails}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: GOLD, fontWeight: 700, fontSize: 13 }}>
                          {formatRupee(aff.totalEarned)}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#22c55e', fontWeight: 700, fontSize: 13 }}>
                          {formatRupee(aff.paidOut)}
                        </td>
                        <td style={{ padding: '12px 16px', color: aff.pendingAmount > 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 13 }}>
                          {formatRupee(aff.pendingAmount)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {aff.pendingAmount > 0 ? (
                            <button
                              onClick={async () => {
                                // Mark all approved conversions as paid for this affiliate
                                const affConvs = conversions.filter(
                                  (c) => typeof c.affiliateId === 'object' && c.affiliateId._id === aff._id && c.status !== 'paid'
                                );
                                await Promise.all(affConvs.map((c) => updateConversionStatus(c._id, 'paid')));
                                loadStats();
                              }}
                              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: GOLD, color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Up to date</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Payout history */}
            <div style={{ background: SURFACE, border: BORDER, borderStyle: 'solid', borderWidth: 1, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontWeight: 700, color: GOLD, fontSize: 14 }}>
                Paid Conversion History
              </div>
              {conversions.filter((c) => c.status === 'paid').length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 32, fontSize: 14 }}>No paid conversions yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Affiliate', 'Commission', 'Date', 'Payout Method'].map((h) => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {conversions
                      .filter((c) => c.status === 'paid')
                      .map((conv, idx, arr) => {
                        const aff = affiliates.find((a) => typeof conv.affiliateId === 'object' && a._id === conv.affiliateId._id);
                        const affName = typeof conv.affiliateId === 'object' ? conv.affiliateId.name : '—';
                        return (
                          <tr
                            key={conv._id}
                            style={{ borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.04)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                          >
                            <td style={{ padding: '11px 16px', color: '#fff', fontSize: 13, fontWeight: 600 }}>{affName}</td>
                            <td style={{ padding: '11px 16px', color: '#22c55e', fontWeight: 700, fontSize: 13 }}>
                              {formatRupee(conv.commissionAmount)}
                            </td>
                            <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{fmtDate(conv.createdAt)}</td>
                            <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                              {aff?.payoutMethod || '—'}
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
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <AffiliateModal
            initial={editAffiliate}
            onClose={() => { setShowModal(false); setEditAffiliate(null); }}
            onSaved={() => { loadAffiliates(); loadStats(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
