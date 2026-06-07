'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type CouponType = 'percentage' | 'flat' | 'free_delivery';

interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  description?: string;
  createdAt: string;
}

interface FormState {
  code: string;
  type: CouponType;
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  perUserLimit: string;
  validFrom: string;
  validUntil: string;
  description: string;
  isActive: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

const GOLD = '#D4AF37';
const DARK_GOLD = '#B8960C';
const BG = '#0a0a0a';
const CARD_BG = '#111111';
const BORDER = '#2a2a2a';

const emptyForm = (): FormState => ({
  code: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxDiscount: '',
  usageLimit: '-1',
  perUserLimit: '1',
  validFrom: '',
  validUntil: '',
  description: '',
  isActive: true,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function isExpired(validUntil: string) {
  return new Date(validUntil) < new Date();
}

function couponStatus(coupon: Coupon): 'active' | 'inactive' | 'expired' {
  if (isExpired(coupon.validUntil)) return 'expired';
  if (!coupon.isActive) return 'inactive';
  return 'active';
}

function typeLabel(type: CouponType) {
  if (type === 'percentage') return '%  Off';
  if (type === 'flat') return '₹  Flat';
  return 'Free Delivery';
}

function discountLabel(coupon: Coupon) {
  if (coupon.type === 'percentage') return `${coupon.value}% Off`;
  if (coupon.type === 'flat') return `₹${coupon.value} Flat`;
  return 'Free Delivery';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  // ── Fetch coupons ──────────────────────────────────────────────────────────
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons ?? []);
      } else {
        setError(data.message ?? 'Failed to load coupons');
      }
    } catch {
      setError('Network error — could not reach server');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => couponStatus(c) === 'active').length;
  const totalUsed = coupons.reduce((sum, c) => sum + c.usedCount, 0);
  const revenueSaved = coupons.reduce((sum, c) => {
    if (c.type === 'flat') return sum + c.value * c.usedCount;
    return sum;
  }, 0);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm());
    setSaveError('');
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditTarget(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: String(coupon.minOrderAmount),
      maxDiscount: coupon.maxDiscount !== undefined ? String(coupon.maxDiscount) : '',
      usageLimit: String(coupon.usageLimit),
      perUserLimit: String(coupon.perUserLimit),
      validFrom: coupon.validFrom.slice(0, 10),
      validUntil: coupon.validUntil.slice(0, 10),
      description: coupon.description ?? '',
      isActive: coupon.isActive,
    });
    setSaveError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
  }

  // ── Save coupon ────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaveError('');
    if (!form.code.trim()) return setSaveError('Coupon code is required');
    if (!form.value) return setSaveError('Value is required');
    if (!form.validFrom || !form.validUntil) return setSaveError('Valid from and until dates are required');

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount || 0),
        usageLimit: Number(form.usageLimit || -1),
        perUserLimit: Number(form.perUserLimit || 1),
        isActive: form.isActive,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        description: form.description || undefined,
      };
      if (form.maxDiscount) payload.maxDiscount = Number(form.maxDiscount);

      const url = editTarget
        ? `${API_BASE}/api/coupons/${editTarget._id}`
        : `${API_BASE}/api/coupons`;
      const method = editTarget ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchCoupons();
      } else {
        setSaveError(data.message ?? 'Save failed');
      }
    } catch {
      setSaveError('Network error — could not save');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(prev => prev.filter(c => c._id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  // ── Toggle active ──────────────────────────────────────────────────────────
  async function handleToggle(coupon: Coupon) {
    setTogglingId(coupon._id);
    try {
      const res = await fetch(`${API_BASE}/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
      }
    } finally {
      setTogglingId(null);
    }
  }

  // ── Copy code ──────────────────────────────────────────────────────────────
  function handleCopy(code: string, id: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '32px 24px', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: GOLD, letterSpacing: '-0.5px', margin: 0 }}>
            Coupons &amp; Promotions
          </h1>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>Manage discount codes and promotional offers</p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: `linear-gradient(135deg, ${GOLD}, ${DARK_GOLD})`,
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Create Coupon
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Coupons', value: totalCoupons, icon: '🎟' },
          { label: 'Active', value: activeCoupons, icon: '✅' },
          { label: 'Total Used', value: totalUsed, icon: '📊' },
          { label: 'Revenue Saved', value: `₹${revenueSaved.toLocaleString('en-IN')}`, icon: '💰' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <span style={{ fontSize: '24px' }}>{stat.icon}</span>
            <span style={{ fontSize: '26px', fontWeight: 700, color: GOLD }}>{stat.value}</span>
            <span style={{ fontSize: '13px', color: '#888' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: '#1a0000', border: '1px solid #ff4444', borderRadius: '8px', padding: '12px 16px', color: '#ff6666', marginBottom: '24px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#555' }}>Loading coupons...</div>
      )}

      {/* ── Empty state ── */}
      {!loading && coupons.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: CARD_BG, borderRadius: '16px', border: `1px dashed ${BORDER}` }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎟</div>
          <h3 style={{ color: '#888', fontWeight: 500 }}>No coupons yet</h3>
          <p style={{ color: '#555', fontSize: '14px' }}>Create your first coupon to start offering discounts</p>
        </div>
      )}

      {/* ── Coupons Table (desktop) ── */}
      {!loading && coupons.length > 0 && (
        <>
          {/* Desktop table */}
          <div style={{ overflowX: 'auto', display: 'block' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '860px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Code', 'Type', 'Value', 'Min Order', 'Used / Limit', 'Valid Until', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: '#666', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => {
                  const status = couponStatus(coupon);
                  const statusColor = status === 'active' ? '#22c55e' : status === 'expired' ? '#ef4444' : '#888';
                  return (
                    <tr key={coupon._id} style={{ borderBottom: `1px solid ${BORDER}`, transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#161616')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Code */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 700, color: GOLD, letterSpacing: '1px', background: '#1a1500', border: `1px dashed ${DARK_GOLD}`, borderRadius: '6px', padding: '2px 8px' }}>
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code, coupon._id)}
                            title="Copy code"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === coupon._id ? '#22c55e' : '#555', fontSize: '14px', padding: '2px' }}
                          >
                            {copiedId === coupon._id ? '✓' : '⎘'}
                          </button>
                        </div>
                        {coupon.description && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coupon.description}</div>}
                      </td>
                      {/* Type */}
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#ccc' }}>{typeLabel(coupon.type)}</td>
                      {/* Value */}
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#fff', fontSize: '14px' }}>{discountLabel(coupon)}</td>
                      {/* Min order */}
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#aaa' }}>₹{coupon.minOrderAmount}</td>
                      {/* Used / Limit */}
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: '#aaa' }}>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{coupon.usedCount}</span>
                        <span style={{ color: '#555' }}> / </span>
                        <span>{coupon.usageLimit === -1 ? '∞' : coupon.usageLimit}</span>
                      </td>
                      {/* Valid until */}
                      <td style={{ padding: '12px 14px', fontSize: '13px', color: status === 'expired' ? '#ef4444' : '#aaa' }}>
                        {formatDate(coupon.validUntil)}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor, background: statusColor + '22', borderRadius: '20px', padding: '3px 10px', textTransform: 'capitalize' }}>
                          {status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {/* Toggle switch */}
                          <button
                            onClick={() => handleToggle(coupon)}
                            disabled={togglingId === coupon._id || status === 'expired'}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                            style={{
                              width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: status === 'expired' ? 'not-allowed' : 'pointer',
                              background: coupon.isActive ? '#22c55e' : '#444', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                              opacity: togglingId === coupon._id ? 0.5 : 1,
                            }}
                          >
                            <span style={{
                              position: 'absolute', top: '3px', left: coupon.isActive ? '18px' : '3px',
                              width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                            }} />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(coupon)}
                            style={{ background: '#1a1a1a', border: `1px solid ${BORDER}`, color: '#aaa', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
                          >Edit</button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            disabled={deletingId === coupon._id}
                            style={{ background: '#1a0000', border: '1px solid #3a0000', color: '#ef4444', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', opacity: deletingId === coupon._id ? 0.5 : 1 }}
                          >Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div style={{ display: 'none' }} className="mobile-coupon-cards">
            {coupons.map(coupon => {
              const status = couponStatus(coupon);
              const statusColor = status === 'active' ? '#22c55e' : status === 'expired' ? '#ef4444' : '#888';
              return (
                <div key={coupon._id} style={{
                  background: CARD_BG, border: `1.5px dashed ${DARK_GOLD}`, borderRadius: '14px',
                  padding: '18px', marginBottom: '14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 800, color: GOLD, letterSpacing: '2px' }}>{coupon.code}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor, background: statusColor + '22', borderRadius: '20px', padding: '3px 10px' }}>{status}</span>
                  </div>
                  <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '13px', color: '#aaa' }}>
                    <span>Type: <b style={{ color: '#fff' }}>{typeLabel(coupon.type)}</b></span>
                    <span>Value: <b style={{ color: GOLD }}>{discountLabel(coupon)}</b></span>
                    <span>Min: <b style={{ color: '#fff' }}>₹{coupon.minOrderAmount}</b></span>
                    <span>Used: <b style={{ color: '#fff' }}>{coupon.usedCount}/{coupon.usageLimit === -1 ? '∞' : coupon.usageLimit}</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL — slide in from right                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      {modalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '480px',
        background: '#0e0e0e', borderLeft: `1px solid ${BORDER}`,
        transform: modalOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 50, overflowY: 'auto', padding: '28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: GOLD, fontWeight: 700, fontSize: '20px', margin: 0 }}>
            {editTarget ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#666', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {saveError && (
          <div style={{ background: '#1a0000', border: '1px solid #ff4444', borderRadius: '8px', padding: '10px 14px', color: '#ff6666', marginBottom: '18px', fontSize: '13px' }}>
            {saveError}
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Code */}
          <FormField label="Coupon Code *">
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. SAVE20"
              style={inputStyle}
            />
          </FormField>

          {/* Type */}
          <FormField label="Type *">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as CouponType }))} style={inputStyle}>
              <option value="percentage">Percentage (% Off)</option>
              <option value="flat">Flat (₹ Off)</option>
              <option value="free_delivery">Free Delivery</option>
            </select>
          </FormField>

          {/* Value */}
          <FormField label={form.type === 'percentage' ? 'Discount % *' : form.type === 'flat' ? 'Flat Discount (₹) *' : 'Delivery Fee Waived (₹) *'}>
            <input
              type="number"
              min="0"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 50'}
              style={inputStyle}
            />
          </FormField>

          {/* Max discount (only for percentage) */}
          {form.type === 'percentage' && (
            <FormField label="Max Discount Cap (₹)">
              <input
                type="number"
                min="0"
                value={form.maxDiscount}
                onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))}
                placeholder="e.g. 200 (leave blank for no cap)"
                style={inputStyle}
              />
            </FormField>
          )}

          {/* Min order */}
          <FormField label="Minimum Order Amount (₹)">
            <input
              type="number"
              min="0"
              value={form.minOrderAmount}
              onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
              placeholder="e.g. 299"
              style={inputStyle}
            />
          </FormField>

          {/* Usage limit */}
          <FormField label="Total Usage Limit (-1 = unlimited)">
            <input
              type="number"
              min="-1"
              value={form.usageLimit}
              onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
              placeholder="-1"
              style={inputStyle}
            />
          </FormField>

          {/* Per user limit */}
          <FormField label="Per Customer Limit">
            <input
              type="number"
              min="1"
              value={form.perUserLimit}
              onChange={e => setForm(f => ({ ...f, perUserLimit: e.target.value }))}
              placeholder="1"
              style={inputStyle}
            />
          </FormField>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Valid From *">
              <input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} style={inputStyle} />
            </FormField>
            <FormField label="Valid Until *">
              <input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} style={inputStyle} />
            </FormField>
          </div>

          {/* Description */}
          <FormField label="Description (optional)">
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short description for this coupon"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </FormField>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161616', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '12px 16px' }}>
            <span style={{ fontSize: '14px', color: '#ccc' }}>Active</span>
            <button
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: form.isActive ? '#22c55e' : '#444', position: 'relative', transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: '4px', left: form.isActive ? '22px' : '4px',
                width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
              }} />
            </button>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? '#555' : `linear-gradient(135deg, ${GOLD}, ${DARK_GOLD})`,
              color: '#000', border: 'none', borderRadius: '8px', padding: '13px',
              fontWeight: 700, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer',
              marginTop: '8px',
            }}
          >
            {saving ? 'Saving...' : editTarget ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#161616',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};
