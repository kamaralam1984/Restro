'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Trash2, ToggleLeft, ToggleRight, X, Copy, Check,
  Percent, IndianRupee, CalendarDays, Hash, ShoppingCart, RefreshCw,
  AlertCircle,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DiscountType = 'percent' | 'flat';

interface Offer {
  id: string;
  name: string;
  code: string;
  discountType: DiscountType;
  value: number;
  minOrderAmount: number;
  validUntil: string;   // ISO date string (YYYY-MM-DD)
  maxUses: number;      // 0 = unlimited
  usedCount: number;
  active: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'admin_offers';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function loadOffers(): Offer[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOffers(offers: Offer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
}

function generateId() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function isExpired(validUntil: string) {
  return validUntil && new Date(validUntil) < new Date(new Date().toDateString());
}

// ---------------------------------------------------------------------------
// Empty form state
// ---------------------------------------------------------------------------
const emptyForm = {
  name: '',
  code: '',
  discountType: 'percent' as DiscountType,
  value: '',
  minOrderAmount: '',
  validUntil: '',
  maxUses: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<typeof emptyForm>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Load from localStorage on mount
  useEffect(() => {
    setOffers(loadOffers());
  }, []);

  // ---------------------------------------------------------------------------
  // Derived list
  // ---------------------------------------------------------------------------
  const filtered = offers.filter((o) => {
    if (filterActive === 'active') return o.active;
    if (filterActive === 'inactive') return !o.active;
    return true;
  });

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------
  function openModal() {
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  }

  function validate() {
    const errors: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.code.trim()) errors.code = 'Code is required';
    else if (!/^[A-Z0-9_-]{2,20}$/i.test(form.code.trim()))
      errors.code = 'Code must be 2-20 alphanumeric/dash/underscore chars';
    const numVal = parseFloat(form.value);
    if (!form.value || isNaN(numVal) || numVal <= 0) errors.value = 'Enter a positive value';
    if (form.discountType === 'percent' && numVal > 100) errors.value = 'Percent cannot exceed 100';
    const minAmt = parseFloat(form.minOrderAmount || '0');
    if (form.minOrderAmount && (isNaN(minAmt) || minAmt < 0))
      errors.minOrderAmount = 'Enter a valid amount';
    if (!form.validUntil) errors.validUntil = 'Expiry date is required';
    const maxU = parseInt(form.maxUses || '0', 10);
    if (form.maxUses && (isNaN(maxU) || maxU < 0))
      errors.maxUses = 'Enter a valid number (0 = unlimited)';
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    // Check duplicate code
    const codeUpper = form.code.trim().toUpperCase();
    if (offers.some((o) => o.code === codeUpper)) {
      setFormErrors({ code: 'This code already exists' });
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 400)); // simulate async

    const newOffer: Offer = {
      id: generateId(),
      name: form.name.trim(),
      code: codeUpper,
      discountType: form.discountType,
      value: parseFloat(form.value),
      minOrderAmount: parseFloat(form.minOrderAmount || '0'),
      validUntil: form.validUntil,
      maxUses: parseInt(form.maxUses || '0', 10),
      usedCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newOffer, ...offers];
    saveOffers(updated);
    setOffers(updated);
    setSaving(false);
    setShowModal(false);
    toast.success(`Offer "${newOffer.name}" created`);
  }

  function toggleActive(id: string) {
    const updated = offers.map((o) =>
      o.id === id ? { ...o, active: !o.active } : o
    );
    saveOffers(updated);
    setOffers(updated);
    const offer = offers.find((o) => o.id === id);
    if (offer) toast.success(`"${offer.name}" ${offer.active ? 'deactivated' : 'activated'}`);
  }

  function deleteOffer(id: string) {
    const offer = offers.find((o) => o.id === id);
    setDeletingId(id);
    setTimeout(() => {
      const updated = offers.filter((o) => o.id !== id);
      saveOffers(updated);
      setOffers(updated);
      setDeletingId(null);
      if (offer) toast.success(`"${offer.name}" deleted`);
    }, 300);
  }

  function copyCode(code: string) {
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  function StatusBadge({ offer }: { offer: Offer }) {
    const expired = isExpired(offer.validUntil);
    if (expired)
      return (
        <span
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
        >
          Expired
        </span>
      );
    if (!offer.active)
      return (
        <span
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(168,144,112,0.15)', color: '#a89070' }}
        >
          Inactive
        </span>
      );
    if (offer.maxUses > 0 && offer.usedCount >= offer.maxUses)
      return (
        <span
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
        >
          Exhausted
        </span>
      );
    return (
      <span
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ background: 'rgba(34,197,94,0.13)', color: '#22c55e' }}
      >
        Active
      </span>
    );
  }

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen p-6" style={{ background: '#080808', color: '#f8f4ed' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a1a', color: '#f8f4ed', border: '1px solid rgba(200,151,42,0.3)' },
        }}
      />

      {/* API-pending banner */}
      <div
        className="flex items-center gap-3 rounded-lg px-4 py-3 mb-6 text-sm"
        style={{ background: 'rgba(200,151,42,0.08)', border: '1px solid rgba(200,151,42,0.25)', color: '#c8972a' }}
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>
          <strong>API integration pending</strong> — offers are stored in browser localStorage.
          Once the backend <code className="text-xs">/api/offers</code> endpoint is available this
          page will switch to server-persisted data automatically.
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a)' }}
          >
            <Tag className="w-5 h-5" style={{ color: '#080808' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#f8f4ed' }}>Offers &amp; Discounts</h1>
            <p className="text-sm" style={{ color: '#a89070' }}>
              {offers.length} offer{offers.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808' }}
        >
          <Plus className="w-4 h-4" />
          New Offer
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['all', 'active', 'inactive'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterActive(tab)}
            className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
            style={
              filterActive === tab
                ? { background: 'rgba(200,151,42,0.2)', color: '#c8972a', border: '1px solid rgba(200,151,42,0.4)' }
                : { background: 'transparent', color: '#a89070', border: '1px solid rgba(168,144,112,0.2)' }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-20 gap-3"
          style={{ border: '1px dashed rgba(200,151,42,0.2)' }}
        >
          <Tag className="w-10 h-10" style={{ color: 'rgba(200,151,42,0.3)' }} />
          <p className="text-sm" style={{ color: '#a89070' }}>
            {filterActive === 'all' ? 'No offers yet. Create your first offer.' : `No ${filterActive} offers.`}
          </p>
          {filterActive === 'all' && (
            <button
              onClick={openModal}
              className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a)', color: '#080808' }}
            >
              + Create Offer
            </button>
          )}
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(200,151,42,0.18)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(200,151,42,0.06)', borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                  {['Offer', 'Code', 'Discount', 'Min Order', 'Valid Until', 'Uses', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#a89070' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((offer, idx) => (
                    <motion.tr
                      key={offer.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: deletingId === offer.id ? 0 : 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid rgba(200,151,42,0.08)' : 'none',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      }}
                    >
                      {/* Offer name */}
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: '#f8f4ed' }}>{offer.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#a89070' }}>
                          Created {new Date(offer.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <code
                            className="text-xs px-2 py-1 rounded font-bold tracking-wider"
                            style={{ background: 'rgba(200,151,42,0.12)', color: '#c8972a', border: '1px solid rgba(200,151,42,0.25)' }}
                          >
                            {offer.code}
                          </code>
                          <button
                            onClick={() => copyCode(offer.code)}
                            className="p-1 rounded transition-colors"
                            style={{ color: '#a89070', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            title="Copy code"
                          >
                            {copiedCode === offer.code
                              ? <Check className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                              : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-semibold" style={{ color: '#f0c060' }}>
                          {offer.discountType === 'percent'
                            ? <><Percent className="w-3.5 h-3.5" />{offer.value}% off</>
                            : <><IndianRupee className="w-3.5 h-3.5" />&#8377;{offer.value} off</>}
                        </div>
                      </td>

                      {/* Min Order */}
                      <td className="px-4 py-3" style={{ color: '#a89070' }}>
                        {offer.minOrderAmount > 0 ? `₹${offer.minOrderAmount}` : '—'}
                      </td>

                      {/* Valid Until */}
                      <td className="px-4 py-3">
                        <span style={{ color: isExpired(offer.validUntil) ? '#ef4444' : '#a89070' }}>
                          {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      {/* Uses */}
                      <td className="px-4 py-3" style={{ color: '#a89070' }}>
                        {offer.usedCount} / {offer.maxUses === 0 ? '∞' : offer.maxUses}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge offer={offer} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Toggle */}
                          <button
                            onClick={() => toggleActive(offer.id)}
                            title={offer.active ? 'Deactivate' : 'Activate'}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: offer.active ? '#22c55e' : '#a89070' }}
                          >
                            {offer.active
                              ? <ToggleRight className="w-5 h-5" />
                              : <ToggleLeft className="w-5 h-5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete offer "${offer.name}"?`)) deleteOffer(offer.id);
                            }}
                            title="Delete"
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a89070' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#a89070'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Create Offer Modal                                                   */}
      {/* ------------------------------------------------------------------- */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: '#111', border: '1px solid rgba(200,151,42,0.3)' }}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5" style={{ color: '#c8972a' }} />
                  <h2 className="font-semibold text-base" style={{ color: '#f8f4ed' }}>New Offer</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg"
                  style={{ color: '#a89070', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#a89070' }}>
                    Offer Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Summer Sale 20%"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: '#1a1a1a',
                      border: `1px solid ${formErrors.name ? '#ef4444' : 'rgba(200,151,42,0.2)'}`,
                      color: '#f8f4ed',
                    }}
                  />
                  {formErrors.name && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{formErrors.name}</p>}
                </div>

                {/* Code */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#a89070' }}>
                    Discount Code *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a89070' }} />
                    <input
                      type="text"
                      placeholder="SAVE20"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none font-mono uppercase tracking-widest"
                      style={{
                        background: '#1a1a1a',
                        border: `1px solid ${formErrors.code ? '#ef4444' : 'rgba(200,151,42,0.2)'}`,
                        color: '#c8972a',
                      }}
                    />
                  </div>
                  {formErrors.code && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{formErrors.code}</p>}
                </div>

                {/* Discount type + value */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#a89070' }}>
                      Discount Type *
                    </label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType })}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid rgba(200,151,42,0.2)',
                        color: '#f8f4ed',
                      }}
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#a89070' }}>
                      Value *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#a89070' }}>
                        {form.discountType === 'percent' ? '%' : '₹'}
                      </span>
                      <input
                        type="number"
                        placeholder={form.discountType === 'percent' ? '20' : '50'}
                        min="1"
                        max={form.discountType === 'percent' ? 100 : undefined}
                        step="any"
                        value={form.value}
                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          background: '#1a1a1a',
                          border: `1px solid ${formErrors.value ? '#ef4444' : 'rgba(200,151,42,0.2)'}`,
                          color: '#f8f4ed',
                        }}
                      />
                    </div>
                    {formErrors.value && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{formErrors.value}</p>}
                  </div>
                </div>

                {/* Min order amount */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#a89070' }}>
                    Minimum Order Amount (₹)
                    <span className="ml-1 font-normal" style={{ color: '#6b5a46' }}>(optional)</span>
                  </label>
                  <div className="relative">
                    <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a89070' }} />
                    <input
                      type="number"
                      placeholder="e.g. 299"
                      min="0"
                      step="any"
                      value={form.minOrderAmount}
                      onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                      style={{
                        background: '#1a1a1a',
                        border: `1px solid ${formErrors.minOrderAmount ? '#ef4444' : 'rgba(200,151,42,0.2)'}`,
                        color: '#f8f4ed',
                      }}
                    />
                  </div>
                  {formErrors.minOrderAmount && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{formErrors.minOrderAmount}</p>}
                </div>

                {/* Valid until + max uses */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#a89070' }}>
                      Valid Until *
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#a89070' }} />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={form.validUntil}
                        onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          background: '#1a1a1a',
                          border: `1px solid ${formErrors.validUntil ? '#ef4444' : 'rgba(200,151,42,0.2)'}`,
                          color: '#f8f4ed',
                          colorScheme: 'dark',
                        }}
                      />
                    </div>
                    {formErrors.validUntil && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{formErrors.validUntil}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#a89070' }}>
                      Max Uses
                      <span className="ml-1 font-normal" style={{ color: '#6b5a46' }}>(0 = unlimited)</span>
                    </label>
                    <div className="relative">
                      <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#a89070' }} />
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        step="1"
                        value={form.maxUses}
                        onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          background: '#1a1a1a',
                          border: `1px solid ${formErrors.maxUses ? '#ef4444' : 'rgba(200,151,42,0.2)'}`,
                          color: '#f8f4ed',
                        }}
                      />
                    </div>
                    {formErrors.maxUses && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{formErrors.maxUses}</p>}
                  </div>
                </div>

                {/* Submit */}
                <div
                  className="flex gap-3 pt-2"
                  style={{ borderTop: '1px solid rgba(200,151,42,0.12)' }}
                >
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(200,151,42,0.2)',
                      color: '#a89070',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                    style={{
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                      opacity: saving ? 0.7 : 1,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      border: 'none',
                    }}
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Offer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
