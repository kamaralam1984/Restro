'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ingredient {
  _id: string;
  name: string;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'pcs';
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  category: string;
  expiryDate?: string;
  isActive: boolean;
}

interface Vendor {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  paymentTerms: string;
  isActive: boolean;
}

interface POItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  total: number;
}

interface PurchaseOrder {
  _id: string;
  vendorId: { _id: string; name: string; phone: string; email: string } | string;
  items: POItem[];
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  totalAmount: number;
  orderedAt?: string;
  receivedAt?: string;
  notes?: string;
  createdAt: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const BASE = 'http://localhost:5000/api/inventory';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#f5f5f5',
    fontFamily: "'Inter', sans-serif",
    padding: '24px',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
  } as React.CSSProperties,
  title: {
    fontSize: '28px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #d4af37, #f5e168)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    color: '#888',
    fontSize: '13px',
    margin: '4px 0 0 0',
  } as React.CSSProperties,
  tabBar: {
    display: 'flex',
    gap: '4px',
    marginBottom: '28px',
    background: '#111',
    borderRadius: '12px',
    padding: '4px',
    border: '1px solid #222',
  } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg, #d4af37, #b8960f)' : 'transparent',
    color: active ? '#0a0a0a' : '#888',
    letterSpacing: '0.02em',
  }),
  card: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '12px',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: '#111',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #222',
  } as React.CSSProperties,
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: 700,
    color: '#d4af37',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    background: '#0d0d0d',
    borderBottom: '1px solid #222',
  } as React.CSSProperties,
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    borderBottom: '1px solid #1a1a1a',
    color: '#ccc',
    verticalAlign: 'middle' as const,
  } as React.CSSProperties,
  btnGold: {
    background: 'linear-gradient(135deg, #d4af37, #b8960f)',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  btnSmall: {
    border: 'none',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as React.CSSProperties,
  btnDanger: {
    background: '#2a0a0a',
    color: '#e05a5a',
    border: '1px solid #4a1a1a',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  input: {
    width: '100%',
    background: '#0d0d0d',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#f5f5f5',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    marginBottom: '6px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  } as React.CSSProperties,
  formGroup: {
    marginBottom: '16px',
  } as React.CSSProperties,
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  } as React.CSSProperties,
  modal: {
    background: '#111',
    border: '1px solid #333',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '580px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    position: 'relative' as const,
  } as React.CSSProperties,
  modalTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#d4af37',
    marginBottom: '24px',
    margin: '0 0 24px 0',
  } as React.CSSProperties,
  searchBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    alignItems: 'center',
  } as React.CSSProperties,
  searchInput: {
    flex: 1,
    background: '#0d0d0d',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f5f5f5',
    fontSize: '13px',
    outline: 'none',
  } as React.CSSProperties,
  select: {
    background: '#0d0d0d',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#f5f5f5',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  badge: (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    ...(color === 'green' && { background: '#0a2a0a', color: '#4ade80', border: '1px solid #1a4a1a' }),
    ...(color === 'yellow' && { background: '#2a2500', color: '#fbbf24', border: '1px solid #4a4000' }),
    ...(color === 'red' && { background: '#2a0a0a', color: '#f87171', border: '1px solid #4a1a1a' }),
    ...(color === 'blue' && { background: '#0a1a2a', color: '#60a5fa', border: '1px solid #1a3a5a' }),
    ...(color === 'gray' && { background: '#1a1a1a', color: '#888', border: '1px solid #333' }),
  }),
  alertCard: {
    background: 'linear-gradient(135deg, #1a0808, #120404)',
    border: '1px solid #4a1010',
    borderRadius: '12px',
    padding: '18px 20px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  } as React.CSSProperties,
  allClear: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#4ade80',
    fontSize: '20px',
    fontWeight: 700,
  } as React.CSSProperties,
  closeBtn: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '22px',
    cursor: 'pointer',
    lineHeight: 1,
  } as React.CSSProperties,
  error: {
    background: '#1a0808',
    border: '1px solid #4a1010',
    color: '#f87171',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '16px',
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#555',
    fontSize: '14px',
  } as React.CSSProperties,
  vendorCard: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  } as React.CSSProperties,
  divider: {
    borderTop: '1px solid #1e1e1e',
    margin: '16px 0',
  } as React.CSSProperties,
};

// ─── Stock level helpers ──────────────────────────────────────────────────────

function stockColor(ing: Ingredient): string {
  if (ing.currentStock <= ing.minStock) return '#f87171';
  const nearThreshold = ing.minStock * 1.2;
  if (ing.currentStock <= nearThreshold) return '#fbbf24';
  return '#4ade80';
}

function stockBadge(ing: Ingredient): { label: string; color: string } {
  if (ing.currentStock <= ing.minStock) return { label: 'Low Stock', color: 'red' };
  const nearThreshold = ing.minStock * 1.2;
  if (ing.currentStock <= nearThreshold) return { label: 'Warning', color: 'yellow' };
  return { label: 'OK', color: 'green' };
}

function poStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'yellow';
    case 'ordered': return 'blue';
    case 'received': return 'green';
    case 'cancelled': return 'red';
    default: return 'gray';
  }
}

function vendorName(po: PurchaseOrder): string {
  if (!po.vendorId) return '—';
  if (typeof po.vendorId === 'string') return po.vendorId;
  return (po.vendorId as any).name || '—';
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ['Stock & Ingredients', 'Vendors', 'Purchase Orders', 'Low Stock Alerts'];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Inventory Management</h1>
          <p style={S.subtitle}>Track stock, manage vendors and purchase orders</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={S.tabBar}>
        {tabs.map((tab, i) => (
          <button key={tab} style={S.tab(activeTab === i)} onClick={() => setActiveTab(i)}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 0 && <IngredientsTab />}
          {activeTab === 1 && <VendorsTab />}
          {activeTab === 2 && <PurchaseOrdersTab />}
          {activeTab === 3 && <LowStockTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — INGREDIENTS
// ═══════════════════════════════════════════════════════════════════════════════

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs'];
const DEFAULT_INGREDIENT = {
  name: '',
  unit: 'kg',
  currentStock: 0,
  minStock: 0,
  maxStock: 0,
  costPerUnit: 0,
  category: '',
  expiryDate: '',
};

function IngredientsTab() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({ ...DEFAULT_INGREDIENT });
  const [adjustData, setAdjustData] = useState({ quantity: 0, type: 'add', reason: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Ingredient[]>('/ingredients');
      setIngredients(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = [...new Set(ingredients.map((i) => i.category).filter(Boolean))];

  const filtered = ingredients.filter((ing) => {
    const matchSearch = ing.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || ing.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ ...DEFAULT_INGREDIENT });
    setError('');
    setShowModal(true);
  };

  const openEdit = (ing: Ingredient) => {
    setEditingItem(ing);
    setFormData({
      name: ing.name,
      unit: ing.unit,
      currentStock: ing.currentStock,
      minStock: ing.minStock,
      maxStock: ing.maxStock,
      costPerUnit: ing.costPerUnit,
      category: ing.category,
      expiryDate: ing.expiryDate ? ing.expiryDate.split('T')[0] : '',
    });
    setError('');
    setShowModal(true);
  };

  const openAdjust = (ing: Ingredient) => {
    setAdjustingItem(ing);
    setAdjustData({ quantity: 0, type: 'add', reason: '' });
    setError('');
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      setError('Name and category are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock),
        maxStock: Number(formData.maxStock),
        costPerUnit: Number(formData.costPerUnit),
        expiryDate: formData.expiryDate || undefined,
      };
      if (editingItem) {
        await apiFetch(`/ingredients/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/ingredients', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ingredient?')) return;
    try {
      await apiFetch(`/ingredients/${id}`, { method: 'DELETE' });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAdjust = async () => {
    if (!adjustingItem) return;
    if (!adjustData.quantity || Number(adjustData.quantity) <= 0) {
      setError('Enter a valid quantity');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/ingredients/${adjustingItem._id}/adjust`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: Number(adjustData.quantity),
          type: adjustData.type,
          reason: adjustData.reason,
        }),
      });
      setAdjustingItem(null);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div style={S.searchBar}>
        <input
          style={S.searchInput}
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={{ ...S.select, width: '160px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button style={S.btnGold} onClick={openAdd}>+ Add Ingredient</button>
      </div>

      {loading ? (
        <div style={S.loading}>Loading ingredients...</div>
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Name</th>
              <th style={S.th}>Category</th>
              <th style={S.th}>Unit</th>
              <th style={S.th}>Current Stock</th>
              <th style={S.th}>Min Stock</th>
              <th style={S.th}>Cost/Unit</th>
              <th style={S.th}>Expiry</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ ...S.td, textAlign: 'center', color: '#444', padding: '40px' }}>
                  No ingredients found
                </td>
              </tr>
            ) : (
              filtered.map((ing) => {
                const badge = stockBadge(ing);
                return (
                  <tr key={ing._id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#141414')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={S.td}>
                      <span style={{ fontWeight: 600, color: '#f5f5f5' }}>{ing.name}</span>
                    </td>
                    <td style={S.td}>{ing.category}</td>
                    <td style={S.td}>{ing.unit}</td>
                    <td style={S.td}>
                      <span style={{ fontWeight: 700, color: stockColor(ing), fontSize: '14px' }}>
                        {ing.currentStock}
                      </span>
                      <span style={{ color: '#555', fontSize: '11px', marginLeft: '4px' }}>{ing.unit}</span>
                    </td>
                    <td style={S.td}>{ing.minStock} {ing.unit}</td>
                    <td style={S.td}>₹{ing.costPerUnit.toFixed(2)}</td>
                    <td style={S.td}>
                      {ing.expiryDate
                        ? new Date(ing.expiryDate).toLocaleDateString('en-IN')
                        : <span style={{ color: '#444' }}>—</span>}
                    </td>
                    <td style={S.td}>
                      <span style={S.badge(badge.color)}>{badge.label}</span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          style={{ ...S.btnSmall, background: '#1a1a2e', color: '#60a5fa', border: '1px solid #1e3a5f' }}
                          onClick={() => openEdit(ing)}
                        >Edit</button>
                        <button
                          style={{ ...S.btnSmall, background: '#1a2a1a', color: '#4ade80', border: '1px solid #1a4a1a' }}
                          onClick={() => openAdjust(ing)}
                        >Adjust</button>
                        <button style={S.btnDanger} onClick={() => handleDelete(ing._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {/* Add/Edit Ingredient Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div style={S.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              style={S.modal}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <button style={S.closeBtn} onClick={() => setShowModal(false)}>×</button>
              <h2 style={S.modalTitle}>{editingItem ? 'Edit Ingredient' : 'Add Ingredient'}</h2>

              {error && <div style={S.error}>{error}</div>}

              <div style={S.formRow}>
                <div>
                  <label style={S.label}>Name *</label>
                  <input style={S.input} value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label style={S.label}>Category *</label>
                  <input style={S.input} value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Dairy, Produce..." />
                </div>
              </div>

              <div style={S.formRow}>
                <div>
                  <label style={S.label}>Unit</label>
                  <select style={S.select} value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Cost per Unit (₹)</label>
                  <input style={S.input} type="number" min="0" step="0.01" value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div style={S.formRow}>
                <div>
                  <label style={S.label}>Current Stock</label>
                  <input style={S.input} type="number" min="0" step="0.01" value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label style={S.label}>Min Stock (Alert Level)</label>
                  <input style={S.input} type="number" min="0" step="0.01" value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div style={S.formRow}>
                <div>
                  <label style={S.label}>Max Stock</label>
                  <input style={S.input} type="number" min="0" step="0.01" value={formData.maxStock}
                    onChange={(e) => setFormData({ ...formData, maxStock: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label style={S.label}>Expiry Date (optional)</label>
                  <input style={S.input} type="date" value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  style={{ ...S.btnSmall, background: '#1a1a1a', color: '#888', border: '1px solid #333', padding: '10px 20px', fontSize: '13px' }}
                  onClick={() => setShowModal(false)}
                >Cancel</button>
                <button style={S.btnGold} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : editingItem ? 'Update Ingredient' : 'Add Ingredient'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {adjustingItem && (
          <motion.div style={S.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              style={{ ...S.modal, maxWidth: '380px' }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <button style={S.closeBtn} onClick={() => setAdjustingItem(null)}>×</button>
              <h2 style={S.modalTitle}>Adjust Stock</h2>
              <p style={{ color: '#888', fontSize: '13px', marginTop: '-16px', marginBottom: '20px' }}>
                {adjustingItem.name} — Current: <span style={{ color: '#d4af37', fontWeight: 700 }}>
                  {adjustingItem.currentStock} {adjustingItem.unit}
                </span>
              </p>

              {error && <div style={S.error}>{error}</div>}

              <div style={S.formGroup}>
                <label style={S.label}>Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['add', 'remove'].map((t) => (
                    <button
                      key={t}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: adjustData.type === t ? '2px solid #d4af37' : '1px solid #333',
                        background: adjustData.type === t ? '#1a1600' : '#0d0d0d',
                        color: adjustData.type === t ? '#d4af37' : '#666',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '13px',
                        textTransform: 'capitalize' as const,
                      }}
                      onClick={() => setAdjustData({ ...adjustData, type: t })}
                    >{t === 'add' ? '+ Add' : '− Remove'}</button>
                  ))}
                </div>
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Quantity ({adjustingItem.unit})</label>
                <input style={S.input} type="number" min="0.01" step="0.01"
                  value={adjustData.quantity || ''}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: parseFloat(e.target.value) || 0 })} />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Reason (optional)</label>
                <input style={S.input} value={adjustData.reason} placeholder="e.g. Spoilage, received delivery..."
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  style={{ ...S.btnSmall, background: '#1a1a1a', color: '#888', border: '1px solid #333', padding: '10px 20px', fontSize: '13px' }}
                  onClick={() => setAdjustingItem(null)}
                >Cancel</button>
                <button style={S.btnGold} onClick={handleAdjust} disabled={saving}>
                  {saving ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — VENDORS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_VENDOR = {
  name: '',
  phone: '',
  email: '',
  address: '',
  gstin: '',
  paymentTerms: 'Net 30',
};

function VendorsTab() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({ ...DEFAULT_VENDOR });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Vendor[]>('/vendors');
      setVendors(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditingVendor(null);
    setFormData({ ...DEFAULT_VENDOR });
    setError('');
    setShowModal(true);
  };

  const openEdit = (v: Vendor) => {
    setEditingVendor(v);
    setFormData({
      name: v.name,
      phone: v.phone,
      email: v.email,
      address: v.address,
      gstin: v.gstin || '',
      paymentTerms: v.paymentTerms,
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setError('Name, phone, and email are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...formData, gstin: formData.gstin || undefined };
      if (editingVendor) {
        await apiFetch(`/vendors/${editingVendor._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/vendors', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vendor?')) return;
    try {
      await apiFetch(`/vendors/${id}`, { method: 'DELETE' });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button style={S.btnGold} onClick={openAdd}>+ Add Vendor</button>
      </div>

      {loading ? (
        <div style={S.loading}>Loading vendors...</div>
      ) : vendors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
          No vendors yet. Add your first vendor.
        </div>
      ) : (
        vendors.map((v) => (
          <motion.div
            key={v._id}
            style={S.vendorCard}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#f5f5f5', marginBottom: '4px' }}>
                {v.name}
              </div>
              <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.7 }}>
                <span>📞 {v.phone}</span>
                <span style={{ margin: '0 12px', color: '#333' }}>|</span>
                <span>✉ {v.email}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {v.address}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                <span style={S.badge('yellow')}>
                  {v.paymentTerms}
                </span>
                {v.gstin && (
                  <span style={{ fontSize: '11px', color: '#666', padding: '2px 8px', background: '#111', border: '1px solid #222', borderRadius: '4px' }}>
                    GSTIN: {v.gstin}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                style={{ ...S.btnSmall, background: '#1a1a2e', color: '#60a5fa', border: '1px solid #1e3a5f' }}
                onClick={() => openEdit(v)}
              >Edit</button>
              <button style={S.btnDanger} onClick={() => handleDelete(v._id)}>Delete</button>
            </div>
          </motion.div>
        ))
      )}

      {/* Vendor Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div style={S.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              style={S.modal}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <button style={S.closeBtn} onClick={() => setShowModal(false)}>×</button>
              <h2 style={S.modalTitle}>{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</h2>

              {error && <div style={S.error}>{error}</div>}

              <div style={S.formRow}>
                <div>
                  <label style={S.label}>Vendor Name *</label>
                  <input style={S.input} value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label style={S.label}>Phone *</label>
                  <input style={S.input} type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              <div style={S.formRow}>
                <div>
                  <label style={S.label}>Email *</label>
                  <input style={S.input} type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label style={S.label}>GSTIN (optional)</label>
                  <input style={S.input} value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="e.g. 07AAACR5055K1Z5" />
                </div>
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Address *</label>
                <input style={S.input} value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>

              <div style={S.formGroup}>
                <label style={S.label}>Payment Terms</label>
                <input style={S.input} value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="e.g. Net 30, Advance, COD" />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  style={{ ...S.btnSmall, background: '#1a1a1a', color: '#888', border: '1px solid #333', padding: '10px 20px', fontSize: '13px' }}
                  onClick={() => setShowModal(false)}
                >Cancel</button>
                <button style={S.btnGold} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

function PurchaseOrdersTab() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Create PO form state
  const [poVendor, setPoVendor] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<Array<{
    ingredientId: string;
    name: string;
    unit: string;
    quantity: number;
    costPerUnit: number;
  }>>([{ ingredientId: '', name: '', unit: '', quantity: 0, costPerUnit: 0 }]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, vendorsData, ingData] = await Promise.all([
        apiFetch<PurchaseOrder[]>('/purchase-orders'),
        apiFetch<Vendor[]>('/vendors'),
        apiFetch<Ingredient[]>('/ingredients'),
      ]);
      setOrders(ordersData);
      setVendors(vendorsData);
      setIngredients(ingData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setPoVendor('');
    setPoNotes('');
    setPoItems([{ ingredientId: '', name: '', unit: '', quantity: 0, costPerUnit: 0 }]);
    setError('');
    setShowModal(true);
  };

  const handleItemChange = (idx: number, field: string, value: string | number) => {
    const updated = [...poItems];
    if (field === 'ingredientId') {
      const ing = ingredients.find((i) => i._id === value);
      updated[idx] = {
        ...updated[idx],
        ingredientId: value as string,
        name: ing?.name || '',
        unit: ing?.unit || '',
        costPerUnit: ing?.costPerUnit || 0,
      };
    } else {
      (updated[idx] as any)[field] = value;
    }
    setPoItems(updated);
  };

  const addItem = () => {
    setPoItems([...poItems, { ingredientId: '', name: '', unit: '', quantity: 0, costPerUnit: 0 }]);
  };

  const removeItem = (idx: number) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const poTotal = poItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.costPerUnit), 0);

  const handleCreatePO = async () => {
    if (!poVendor) { setError('Select a vendor'); return; }
    const validItems = poItems.filter((i) => i.ingredientId && Number(i.quantity) > 0);
    if (validItems.length === 0) { setError('Add at least one item with quantity > 0'); return; }

    setSaving(true);
    setError('');
    try {
      await apiFetch('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({
          vendorId: poVendor,
          items: validItems,
          notes: poNotes || undefined,
        }),
      });
      setShowModal(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const labels: Record<string, string> = {
      ordered: 'Mark as Ordered?',
      received: 'Mark as Received? This will update ingredient stocks.',
      cancelled: 'Cancel this order?',
    };
    if (!confirm(labels[status] || `Change status to ${status}?`)) return;
    try {
      await apiFetch(`/purchase-orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button style={S.btnGold} onClick={openCreate}>+ Create PO</button>
      </div>

      {error && <div style={S.error}>{error}</div>}

      {loading ? (
        <div style={S.loading}>Loading purchase orders...</div>
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>PO #</th>
              <th style={S.th}>Vendor</th>
              <th style={S.th}>Items</th>
              <th style={S.th}>Total</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Date</th>
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#444', padding: '40px' }}>
                  No purchase orders yet
                </td>
              </tr>
            ) : (
              orders.map((po, idx) => (
                <tr key={po._id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#141414')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={S.td}>
                    <span style={{ fontFamily: 'monospace', color: '#d4af37', fontWeight: 700, fontSize: '12px' }}>
                      #{String(idx + 1).padStart(4, '0')}
                    </span>
                  </td>
                  <td style={S.td}>{vendorName(po)}</td>
                  <td style={S.td}>
                    <span style={S.badge('blue')}>{po.items.length} item{po.items.length !== 1 ? 's' : ''}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{ fontWeight: 700, color: '#f5f5f5' }}>₹{po.totalAmount.toFixed(2)}</span>
                  </td>
                  <td style={S.td}>
                    <span style={S.badge(poStatusColor(po.status))}>{po.status}</span>
                  </td>
                  <td style={S.td}>
                    {new Date(po.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' as const }}>
                      {po.status === 'pending' && (
                        <button
                          style={{ ...S.btnSmall, background: '#0a1a2e', color: '#60a5fa', border: '1px solid #1e3a5f' }}
                          onClick={() => handleStatusUpdate(po._id, 'ordered')}
                        >Mark Ordered</button>
                      )}
                      {po.status === 'ordered' && (
                        <button
                          style={{ ...S.btnSmall, background: '#0a2a0a', color: '#4ade80', border: '1px solid #1a4a1a' }}
                          onClick={() => handleStatusUpdate(po._id, 'received')}
                        >Mark Received</button>
                      )}
                      {(po.status === 'pending' || po.status === 'ordered') && (
                        <button
                          style={S.btnDanger}
                          onClick={() => handleStatusUpdate(po._id, 'cancelled')}
                        >Cancel</button>
                      )}
                      {(po.status === 'received' || po.status === 'cancelled') && (
                        <span style={{ color: '#444', fontSize: '12px' }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Create PO Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div style={S.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              style={{ ...S.modal, maxWidth: '680px' }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <button style={S.closeBtn} onClick={() => setShowModal(false)}>×</button>
              <h2 style={S.modalTitle}>Create Purchase Order</h2>

              {error && <div style={S.error}>{error}</div>}

              <div style={S.formRow}>
                <div>
                  <label style={S.label}>Vendor *</label>
                  <select style={S.select} value={poVendor} onChange={(e) => setPoVendor(e.target.value)}>
                    <option value="">Select vendor...</option>
                    {vendors.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Notes (optional)</label>
                  <input style={S.input} value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    placeholder="Special instructions..." />
                </div>
              </div>

              <div style={S.divider} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ ...S.label, margin: 0 }}>Items</label>
                <button
                  style={{ ...S.btnSmall, background: '#1a1600', color: '#d4af37', border: '1px solid #3a3000' }}
                  onClick={addItem}
                >+ Add Item</button>
              </div>

              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 100px 24px', gap: '8px', marginBottom: '6px' }}>
                {['Ingredient', 'Qty', 'Unit', 'Cost/Unit', ''].map((h) => (
                  <div key={h} style={{ ...S.label, margin: 0 }}>{h}</div>
                ))}
              </div>

              {poItems.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 100px 24px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <select style={S.select} value={item.ingredientId}
                    onChange={(e) => handleItemChange(idx, 'ingredientId', e.target.value)}>
                    <option value="">Select ingredient...</option>
                    {ingredients.map((ing) => (
                      <option key={ing._id} value={ing._id}>{ing.name}</option>
                    ))}
                  </select>
                  <input style={S.input} type="number" min="0.01" step="0.01" placeholder="0"
                    value={item.quantity || ''}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                  <input style={{ ...S.input, background: '#080808', color: '#555' }}
                    value={item.unit} readOnly placeholder="unit" />
                  <input style={S.input} type="number" min="0" step="0.01" placeholder="0"
                    value={item.costPerUnit || ''}
                    onChange={(e) => handleItemChange(idx, 'costPerUnit', parseFloat(e.target.value) || 0)} />
                  <button
                    style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
                    onClick={() => removeItem(idx)}
                    title="Remove item"
                  >×</button>
                </div>
              ))}

              <div style={S.divider} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>Total Amount</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#d4af37' }}>₹{poTotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  style={{ ...S.btnSmall, background: '#1a1a1a', color: '#888', border: '1px solid #333', padding: '10px 20px', fontSize: '13px' }}
                  onClick={() => setShowModal(false)}
                >Cancel</button>
                <button style={S.btnGold} onClick={handleCreatePO} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Purchase Order'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — LOW STOCK ALERTS
// ═══════════════════════════════════════════════════════════════════════════════

function LowStockTab() {
  const [lowStock, setLowStock] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch<Ingredient[]>('/ingredients?low=true');
        setLowStock(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={S.loading}>Checking stock levels...</div>;
  if (error) return <div style={S.error}>{error}</div>;

  if (lowStock.length === 0) {
    return (
      <motion.div
        style={S.allClear}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
        <div>All stock levels are healthy</div>
        <div style={{ fontSize: '14px', color: '#4a4a4a', fontWeight: 400, marginTop: '8px' }}>
          No ingredients are at or below minimum stock threshold
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={S.badge('red')}>{lowStock.length} Alert{lowStock.length !== 1 ? 's' : ''}</span>
        <span style={{ color: '#888', fontSize: '13px' }}>
          Ingredients at or below minimum stock level
        </span>
      </div>

      {lowStock.map((ing, i) => {
        const deficit = ing.minStock - ing.currentStock;
        const pct = ing.minStock > 0 ? Math.round((ing.currentStock / ing.minStock) * 100) : 0;
        return (
          <motion.div
            key={ing._id}
            style={S.alertCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#f5f5f5' }}>{ing.name}</span>
                <span style={S.badge('red')}>Critical</span>
              </div>
              <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#888' }}>Current: </span>
                  <span style={{ color: '#f87171', fontWeight: 700 }}>{ing.currentStock} {ing.unit}</span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Minimum: </span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>{ing.minStock} {ing.unit}</span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Shortfall: </span>
                  <span style={{ color: '#fc8181', fontWeight: 700 }}>
                    {deficit > 0 ? deficit : 0} {ing.unit}
                  </span>
                </div>
              </div>
              {/* Stock bar */}
              <div style={{
                height: '4px', background: '#1a0808', borderRadius: '2px', marginTop: '10px',
                width: '240px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(pct, 100)}%`,
                  background: pct <= 50 ? '#ef4444' : '#f87171',
                  borderRadius: '2px',
                  transition: 'width 0.5s',
                }} />
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {pct}% of minimum threshold
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
              <span style={{ color: '#888', fontSize: '11px' }}>Category: {ing.category}</span>
              <span style={{ color: '#888', fontSize: '11px' }}>₹{ing.costPerUnit}/unit</span>
              <button
                style={{
                  ...S.btnSmall,
                  background: 'linear-gradient(135deg, #d4af37, #b8960f)',
                  color: '#0a0a0a',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
                onClick={() => {
                  // Navigate to purchase orders tab by dispatching a custom event
                  window.dispatchEvent(new CustomEvent('inventory-tab-change', { detail: 2 }));
                  // Provide ingredient info via sessionStorage for pre-selection
                  sessionStorage.setItem('po-prefill-ingredient', JSON.stringify({
                    ingredientId: ing._id,
                    name: ing.name,
                    unit: ing.unit,
                    costPerUnit: ing.costPerUnit,
                    suggestedQty: ing.maxStock - ing.currentStock,
                  }));
                }}
              >Create PO</button>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
