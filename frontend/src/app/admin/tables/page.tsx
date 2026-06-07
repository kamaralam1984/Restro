'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Pencil, Trash2, X, ChefHat, Settings } from 'lucide-react';
import api from '@/services/api';

// ─── Theme tokens ──────────────────────────────────────────────────────────────
const T = {
  bg: '#080808',
  card: '#141414',
  input: '#1c1c1c',
  gold: '#c8972a',
  goldLight: '#f0c060',
  text: '#f8f4ed',
  muted: '#a89070',
  border: 'rgba(200,151,42,0.15)',
};

const goldGradient = `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`;

// ─── Section badge config ──────────────────────────────────────────────────────
const SECTION_BADGE: Record<string, { color: string; bg: string; label: string }> = {
  corner:  { color: '#c8972a', bg: 'rgba(200,151,42,0.12)',  label: 'Corner' },
  center:  { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  label: 'Centre' },
  window:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Window Side' },
  outdoor: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Outdoor' },
  other:   { color: '#f0c060', bg: 'rgba(240,192,96,0.12)',  label: 'Other' },
};

const SECTION_FILTER_LABELS: Array<{ key: string; label: string }> = [
  { key: 'all',     label: 'All' },
  { key: 'corner',  label: 'Corner' },
  { key: 'center',  label: 'Centre' },
  { key: 'window',  label: 'Window' },
  { key: 'outdoor', label: 'Outdoor' },
  { key: 'other',   label: 'Other' },
];

const CAPACITY_FILTERS = ['All', '2', '4', '6', '12'];

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  available:   { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  booked:      { color: '#c8972a', bg: 'rgba(200,151,42,0.12)' },
  maintenance: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

// ─── Types ─────────────────────────────────────────────────────────────────────
interface TableData {
  _id: string;
  tableNumber: string;
  capacity: number;
  section: string;
  row: number;
  column: number;
  hourlyRate?: number;
  status: 'available' | 'booked' | 'maintenance';
}

interface FormState {
  tableNumber: string;
  capacity: string;
  section: string;
  row: string;
  column: string;
  hourlyRate: string;
}

const EMPTY_FORM: FormState = {
  tableNumber: '',
  capacity: '4',
  section: 'corner',
  row: '1',
  column: '1',
  hourlyRate: '',
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function TablesPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<TableData | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Get restaurant slug from localStorage ─────────────────────────────────
  const getRestaurantSlug = (): string | undefined => {
    try {
      const admin = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
      if (admin) return JSON.parse(admin).restaurantSlug;
    } catch {}
    return undefined;
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTables = async () => {
    try {
      setLoading(true);
      const slug = getRestaurantSlug();
      const params = slug ? { restaurant: slug } : {};
      const res = await api.get('/tables', { params });
      const raw = (res as any)?.data?.data || (res as any)?.data || res;
      setTables(Array.isArray(raw) ? raw : []);
    } catch {
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  // ── Filters ────────────────────────────────────────────────────────────────
  const filtered = tables.filter(t => {
    const secOk = sectionFilter === 'all' || t.section === sectionFilter;
    const capOk = capacityFilter === 'All' || String(t.capacity) === capacityFilter;
    return secOk && capOk;
  });

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (t: TableData) => {
    setEditTarget(t);
    setForm({
      tableNumber: t.tableNumber,
      capacity: String(t.capacity),
      section: t.section,
      row: String(t.row),
      column: String(t.column),
      hourlyRate: t.hourlyRate != null ? String(t.hourlyRate) : '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.tableNumber.trim()) return;
    setSaving(true);
    const payload = {
      tableNumber: form.tableNumber.trim(),
      capacity: Number(form.capacity),
      section: form.section,
      row: Number(form.row),
      column: Number(form.column),
      ...(form.hourlyRate !== '' && { hourlyRate: Number(form.hourlyRate) }),
    };
    try {
      if (editTarget) {
        const res = await api.put(`/tables/${editTarget._id}`, payload);
        setTables(prev => prev.map(t => t._id === editTarget._id ? (res.data?.data || res.data) : t));
      } else {
        const res = await api.post('/tables', payload);
        setTables(prev => [...prev, res.data?.data || res.data]);
      }
      closeModal();
    } catch {
      setError('Failed to save table');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tables/${id}`);
      setTables(prev => prev.filter(t => t._id !== id));
      setConfirmDeleteId(null);
    } catch {
      setError('Failed to delete table');
    }
  };

  // ── Initialize defaults ────────────────────────────────────────────────────
  const handleInitialize = async () => {
    setInitLoading(true);
    try {
      const slug = getRestaurantSlug();
      await api.post('/tables/initialize', slug ? { restaurantSlug: slug } : {});
      await fetchTables();
    } catch {
      setError('Failed to initialize defaults');
    } finally {
      setInitLoading(false);
    }
  };

  // ── Pill helpers ───────────────────────────────────────────────────────────
  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 16px',
    borderRadius: '999px',
    border: `1px solid ${active ? T.gold : T.border}`,
    background: active ? 'rgba(200,151,42,0.15)' : 'transparent',
    color: active ? T.goldLight : T.muted,
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.2s',
  });

  const inputStyle: React.CSSProperties = {
    background: T.input,
    border: `1px solid ${T.border}`,
    borderRadius: '8px',
    color: T.text,
    padding: '10px 14px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    color: T.muted,
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'block',
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '32px 24px' }}>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div style={{
            background: 'rgba(200,151,42,0.12)',
            border: `1px solid ${T.border}`,
            borderRadius: '12px',
            padding: '10px',
          }}>
            <ChefHat size={22} style={{ color: T.gold }} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: T.text, margin: 0 }}>
              Table Management
            </h1>
            <p style={{ color: T.muted, fontSize: '13px', margin: 0 }}>
              {tables.length} table{tables.length !== 1 ? 's' : ''} configured
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Initialize Defaults */}
          <button
            onClick={handleInitialize}
            disabled={initLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: `1px solid ${T.gold}`,
              background: 'transparent',
              color: T.gold,
              fontSize: '14px',
              fontWeight: 600,
              cursor: initLoading ? 'not-allowed' : 'pointer',
              opacity: initLoading ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            <Settings size={16} />
            {initLoading ? 'Initializing…' : 'Initialize Defaults'}
          </button>

          {/* Add Table */}
          <button
            onClick={openAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: goldGradient,
              color: '#080808',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(200,151,42,0.35)',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={16} />
            Add Table
          </button>
        </div>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fca5a5',
            }}
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        {/* Section filter */}
        <div className="mb-4">
          <p style={{ color: T.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Section
          </p>
          <div className="flex flex-wrap gap-2">
            {SECTION_FILTER_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSectionFilter(key)}
                style={pillStyle(sectionFilter === key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Capacity filter */}
        <div>
          <p style={{ color: T.muted, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Capacity
          </p>
          <div className="flex flex-wrap gap-2">
            {CAPACITY_FILTERS.map(cap => (
              <button
                key={cap}
                onClick={() => setCapacityFilter(cap)}
                style={pillStyle(capacityFilter === cap)}
              >
                {cap === 'All' ? 'All' : `${cap} persons`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table cards grid */}
      {loading ? (
        <div className="flex items-center justify-center" style={{ height: '200px', color: T.muted }}>
          Loading tables…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center" style={{ height: '200px', color: T.muted, gap: '12px' }}>
          <ChefHat size={40} style={{ opacity: 0.3 }} />
          <p>No tables found. Add one or initialize defaults.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map(table => {
              const sec = SECTION_BADGE[table.section] ?? SECTION_BADGE.other;
              const sta = STATUS_COLORS[table.status] ?? STATUS_COLORS.available;
              const isConfirming = confirmDeleteId === table._id;

              return (
                <motion.div
                  key={table._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: T.card,
                    border: `1px solid ${T.border}`,
                    borderRadius: '14px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Gold top accent */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '2px',
                    background: goldGradient,
                    opacity: 0.6,
                  }} />

                  {/* Table number */}
                  <div style={{ fontSize: '36px', fontWeight: 800, color: T.gold, lineHeight: 1 }}>
                    {table.tableNumber}
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-2" style={{ color: T.muted, fontSize: '13px' }}>
                    <Users size={14} style={{ color: T.gold }} />
                    <span>{table.capacity} persons</span>
                  </div>

                  {/* Section badge */}
                  <span style={{
                    display: 'inline-block',
                    background: sec.bg,
                    color: sec.color,
                    border: `1px solid ${sec.color}33`,
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    alignSelf: 'flex-start',
                  }}>
                    {sec.label}
                  </span>

                  {/* Hourly rate */}
                  {table.hourlyRate != null && (
                    <div style={{ color: T.muted, fontSize: '12px' }}>
                      <span style={{ color: T.goldLight, fontWeight: 600 }}>₹{table.hourlyRate}</span>
                      <span> / hr</span>
                    </div>
                  )}

                  {/* Status badge */}
                  <span style={{
                    display: 'inline-block',
                    background: sta.bg,
                    color: sta.color,
                    border: `1px solid ${sta.color}33`,
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    alignSelf: 'flex-start',
                  }}>
                    {table.status}
                  </span>

                  {/* Row/Col info */}
                  <div style={{ color: T.muted, fontSize: '11px' }}>
                    Row {table.row}, Col {table.column}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      onClick={() => openEdit(table)}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: `1px solid ${T.border}`,
                        background: 'rgba(200,151,42,0.06)',
                        color: T.gold,
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Pencil size={13} />
                      Edit
                    </button>

                    {!isConfirming ? (
                      <button
                        onClick={() => setConfirmDeleteId(table._id)}
                        style={{
                          flex: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid rgba(239,68,68,0.25)',
                          background: 'rgba(239,68,68,0.06)',
                          color: '#ef4444',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    ) : (
                      <div className="flex gap-1" style={{ flex: 1 }}>
                        <button
                          onClick={() => handleDelete(table._id)}
                          style={{
                            flex: 1,
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{
                            flex: 1,
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: `1px solid ${T.border}`,
                            background: 'transparent',
                            color: T.muted,
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100,
              padding: '16px',
            }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: '18px',
                width: '100%',
                maxWidth: '520px',
                overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              }}
            >
              {/* Modal header */}
              <div style={{
                borderBottom: `1px solid ${T.border}`,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  {editTarget ? 'Edit Table' : 'Add New Table'}
                </h2>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${T.border}`,
                    borderRadius: '8px',
                    color: T.muted,
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* Table Number */}
                <div>
                  <label style={labelStyle}>Table Number *</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. T1, A3, 12"
                    value={form.tableNumber}
                    onChange={e => setForm(p => ({ ...p, tableNumber: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Capacity */}
                  <div>
                    <label style={labelStyle}>Capacity</label>
                    <select
                      style={inputStyle}
                      value={form.capacity}
                      onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                    >
                      {['2', '4', '6', '12'].map(c => (
                        <option key={c} value={c} style={{ background: T.input }}>{c} persons</option>
                      ))}
                    </select>
                  </div>

                  {/* Section */}
                  <div>
                    <label style={labelStyle}>Section</label>
                    <select
                      style={inputStyle}
                      value={form.section}
                      onChange={e => setForm(p => ({ ...p, section: e.target.value }))}
                    >
                      <option value="corner"  style={{ background: T.input }}>Corner</option>
                      <option value="center"  style={{ background: T.input }}>Centre</option>
                      <option value="window"  style={{ background: T.input }}>Window Side</option>
                      <option value="outdoor" style={{ background: T.input }}>Outdoor</option>
                      <option value="other"   style={{ background: T.input }}>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Row */}
                  <div>
                    <label style={labelStyle}>Row (1–10)</label>
                    <select
                      style={inputStyle}
                      value={form.row}
                      onChange={e => setForm(p => ({ ...p, row: e.target.value }))}
                    >
                      {Array.from({ length: 10 }, (_, i) => String(i + 1)).map(r => (
                        <option key={r} value={r} style={{ background: T.input }}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Column */}
                  <div>
                    <label style={labelStyle}>Column (1–10)</label>
                    <select
                      style={inputStyle}
                      value={form.column}
                      onChange={e => setForm(p => ({ ...p, column: e.target.value }))}
                    >
                      {Array.from({ length: 10 }, (_, i) => String(i + 1)).map(c => (
                        <option key={c} value={c} style={{ background: T.input }}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hourly Rate */}
                <div>
                  <label style={labelStyle}>Hourly Rate (optional)</label>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="e.g. 500"
                    value={form.hourlyRate}
                    onChange={e => setForm(p => ({ ...p, hourlyRate: e.target.value }))}
                    min="0"
                  />
                </div>

                {/* Modal actions */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={closeModal}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: `1px solid ${T.border}`,
                      background: 'transparent',
                      color: T.muted,
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.tableNumber.trim()}
                    style={{
                      flex: 2,
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: saving || !form.tableNumber.trim() ? 'rgba(200,151,42,0.3)' : goldGradient,
                      color: saving || !form.tableNumber.trim() ? T.muted : '#080808',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: saving || !form.tableNumber.trim() ? 'not-allowed' : 'pointer',
                      boxShadow: saving || !form.tableNumber.trim() ? 'none' : '0 4px 20px rgba(200,151,42,0.35)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Add Table'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
