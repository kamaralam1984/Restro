'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lead {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  source: 'walk-in' | 'online' | 'referral' | 'social' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  followUpDate?: string;
  assignedTo?: string;
  tags: string[];
  createdAt: string;
}

type LeadStatus = Lead['status'];
type LeadSource = Lead['source'];

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted'];
const SOURCES: LeadSource[] = ['walk-in', 'online', 'referral', 'social', 'other'];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  qualified: '#8b5cf6',
  converted: '#22c55e',
  lost: '#ef4444',
};

const SOURCE_COLORS: Record<LeadSource, string> = {
  'walk-in': '#f59e0b',
  online: '#3b82f6',
  referral: '#22c55e',
  social: '#a855f7',
  other: '#6b7280',
};

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  onClose: () => void;
  onSave: (data: Partial<Lead>) => void;
  initial?: Partial<Lead>;
}

function LeadModal({ onClose, onSave, initial }: ModalProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    source: (initial?.source ?? 'other') as LeadSource,
    notes: initial?.notes ?? '',
    followUpDate: initial?.followUpDate ? initial.followUpDate.split('T')[0] : '',
    tags: (initial?.tags ?? []).join(', '),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    onSave({
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      followUpDate: form.followUpDate || undefined,
      email: form.email || undefined,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#888', marginBottom: 4, display: 'block' };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          background: '#111', border: '1px solid #d4af37', borderRadius: 16,
          padding: 32, width: '100%', maxWidth: 480,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#d4af37', fontSize: 20, fontWeight: 700, margin: 0 }}>
            {initial?._id ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 22 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Rahul Sharma" />
          </div>
          <div>
            <label style={labelStyle}>Phone *</label>
            <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={form.email} onChange={set('email')} placeholder="optional" type="email" />
          </div>
          <div>
            <label style={labelStyle}>Source</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.source} onChange={set('source')}>
              {SOURCES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Follow-up Date</label>
            <input style={inputStyle} value={form.followUpDate} onChange={set('followUpDate')} type="date" />
          </div>
          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input style={inputStyle} value={form.tags} onChange={set('tags')} placeholder="e.g. wedding, bulk, vip" />
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              value={form.notes}
              onChange={set('notes')}
              placeholder="Add notes..."
            />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="button" onClick={onClose}
              style={{
                flex: 1, padding: '12px', borderRadius: 8, border: '1px solid #333',
                background: 'transparent', color: '#888', cursor: 'pointer', fontWeight: 600,
              }}
            >Cancel</button>
            <button
              type="submit"
              style={{
                flex: 1, padding: '12px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#000',
                cursor: 'pointer', fontWeight: 700,
              }}
            >{initial?._id ? 'Save Changes' : 'Add Lead'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

interface KanbanColProps {
  status: LeadStatus;
  leads: Lead[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

function KanbanColumn({ status, leads, onStatusChange, onEdit, onDelete }: KanbanColProps) {
  const color = STATUS_COLORS[status];
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div style={{ flex: 1, minWidth: 220, maxWidth: 280 }}>
      <div style={{
        background: '#0d0d0d', borderRadius: 12, border: `1px solid #1e1e1e`,
        borderTop: `3px solid ${color}`, overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: color, color: '#000', borderRadius: 20, padding: '2px 10px',
            fontSize: 12, fontWeight: 700,
          }}>{label}</span>
          <span style={{ color: '#555', fontSize: 12 }}>{leads.length}</span>
        </div>
        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 }}>
          <AnimatePresence>
            {leads.map((lead) => (
              <motion.div
                key={lead._id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  background: '#161616', border: '1px solid #252525', borderRadius: 10,
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{lead.name}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => onEdit(lead)}
                      style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: 13, padding: 2 }}
                    >✎</button>
                    <button
                      onClick={() => onDelete(lead._id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: 2 }}
                    >✕</button>
                  </div>
                </div>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>{lead.phone}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                  <span style={{
                    background: SOURCE_COLORS[lead.source] + '22',
                    color: SOURCE_COLORS[lead.source],
                    borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 600,
                  }}>{lead.source}</span>
                  {lead.tags.slice(0, 2).map((tag) => (
                    <span key={tag} style={{
                      background: '#d4af3722', color: '#d4af37',
                      borderRadius: 4, padding: '1px 7px', fontSize: 11,
                    }}>{tag}</span>
                  ))}
                </div>
                <select
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead._id, e.target.value as LeadStatus)}
                  style={{
                    width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a',
                    borderRadius: 6, padding: '4px 8px', color: '#bbb', fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {(['new', 'contacted', 'qualified', 'converted', 'lost'] as LeadStatus[]).map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </motion.div>
            ))}
          </AnimatePresence>
          {leads.length === 0 && (
            <div style={{ color: '#333', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No leads</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Segment Card ─────────────────────────────────────────────────────────────

interface SegmentInfo {
  label: string;
  key: string;
  count: number;
  avgSpend: number;
  color: string;
  icon: string;
  desc: string;
}

function SegmentCard({ seg, onCampaign }: { seg: SegmentInfo; onCampaign: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      style={{
        background: '#0d0d0d', border: `1px solid ${seg.color}33`,
        borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: seg.color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>{seg.icon}</div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{seg.label}</div>
          <div style={{ color: '#555', fontSize: 12 }}>{seg.desc}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <div style={{ color: seg.color, fontSize: 28, fontWeight: 700 }}>{seg.count}</div>
          <div style={{ color: '#555', fontSize: 11 }}>Customers</div>
        </div>
        <div>
          <div style={{ color: '#d4af37', fontSize: 28, fontWeight: 700 }}>₹{seg.avgSpend}</div>
          <div style={{ color: '#555', fontSize: 11 }}>Avg Spend</div>
        </div>
      </div>
      <button
        onClick={onCampaign}
        style={{
          background: 'transparent', border: `1px solid ${seg.color}`,
          borderRadius: 8, padding: '8px 16px', color: seg.color,
          cursor: 'pointer', fontWeight: 600, fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        Create Campaign →
      </button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [tab, setTab] = useState<'pipeline' | 'segments' | 'followups'>('pipeline');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await api.get<Lead[]>('/crm/leads', { headers });
      setLeads(data);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (data: Partial<Lead>) => {
    try {
      if (editingLead?._id) {
        const updated = await api.put<Lead>(`/crm/leads/${editingLead._id}`, data, { headers });
        setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
        toast.success('Lead updated');
      } else {
        const created = await api.post<Lead>('/crm/leads', data, { headers });
        setLeads((prev) => [created, ...prev]);
        toast.success('Lead added');
      }
      setShowModal(false);
      setEditingLead(undefined);
    } catch {
      toast.error('Failed to save lead');
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      const updated = await api.put<Lead>(`/crm/leads/${id}`, { status }, { headers });
      setLeads((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await api.delete(`/crm/leads/${id}`, { headers });
      setLeads((prev) => prev.filter((l) => l._id !== id));
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  // Kanban columns
  const pipelineLeads = leads.filter((l) => l.status !== 'lost');
  const byStatus = (s: LeadStatus) => pipelineLeads.filter((l) => l.status === s);

  // Follow-ups
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpLeads = leads
    .filter((l) => l.followUpDate)
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime());

  const getDueBadge = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    if (d < today) return { label: 'Overdue', color: '#ef4444' };
    if (d.getTime() === today.getTime()) return { label: 'Today', color: '#f59e0b' };
    return { label: 'Upcoming', color: '#22c55e' };
  };

  // Segments (mock-calculated from leads + some placeholders)
  const totalCustomers = 284;
  const segments: SegmentInfo[] = [
    { label: 'All Customers', key: 'all', count: totalCustomers, avgSpend: 420, color: '#d4af37', icon: '👥', desc: 'Every customer who has ordered' },
    { label: 'New Customers', key: 'new', count: 48, avgSpend: 280, color: '#3b82f6', icon: '🌟', desc: 'First order this month' },
    { label: 'Returning', key: 'returning', count: 156, avgSpend: 510, color: '#22c55e', icon: '🔄', desc: '2+ orders placed' },
    { label: 'VIP', key: 'vip', count: 32, avgSpend: 1840, color: '#a855f7', icon: '👑', desc: '5+ orders or spent >₹5000' },
    { label: 'Inactive', key: 'inactive', count: 48, avgSpend: 310, color: '#ef4444', icon: '💤', desc: 'No order in 30+ days' },
  ];

  // Styles
  const pageStyle: React.CSSProperties = {
    background: '#080808', minHeight: '100vh', padding: '28px 24px',
    fontFamily: "'Inter', sans-serif",
  };
  const headerStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28,
  };
  const tabBarStyle: React.CSSProperties = {
    display: 'flex', gap: 4, background: '#111', borderRadius: 12, padding: 4, marginBottom: 28,
    border: '1px solid #1e1e1e',
  };
  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: active ? 700 : 500, fontSize: 14, transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg, #d4af37, #f0d060)' : 'transparent',
    color: active ? '#000' : '#666',
  });
  const addBtnStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#000', border: 'none',
    borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  };

  return (
    <div style={pageStyle}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid #d4af37' } }} />

      <div style={headerStyle}>
        <div>
          <h1 style={{ color: '#d4af37', fontSize: 28, fontWeight: 800, margin: 0 }}>CRM System</h1>
          <p style={{ color: '#555', fontSize: 14, margin: '4px 0 0' }}>Manage leads, segments, and follow-ups</p>
        </div>
        <button style={addBtnStyle} onClick={() => { setEditingLead(undefined); setShowModal(true); }}>
          + Add Lead
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Leads', value: leads.length, color: '#d4af37' },
          { label: 'New', value: leads.filter((l) => l.status === 'new').length, color: '#3b82f6' },
          { label: 'Qualified', value: leads.filter((l) => l.status === 'qualified').length, color: '#a855f7' },
          { label: 'Converted', value: leads.filter((l) => l.status === 'converted').length, color: '#22c55e' },
          { label: 'Follow-ups Due', value: followUpLeads.filter((l) => { const d = new Date(l.followUpDate!); d.setHours(0,0,0,0); return d <= today; }).length, color: '#ef4444' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 12,
            padding: '14px 20px', minWidth: 120,
          }}>
            <div style={{ color: s.color, fontSize: 26, fontWeight: 800 }}>{s.value}</div>
            <div style={{ color: '#555', fontSize: 12 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={tabBarStyle}>
        <button style={tabBtnStyle(tab === 'pipeline')} onClick={() => setTab('pipeline')}>Leads Pipeline</button>
        <button style={tabBtnStyle(tab === 'segments')} onClick={() => setTab('segments')}>Customer Segments</button>
        <button style={tabBtnStyle(tab === 'followups')} onClick={() => setTab('followups')}>Follow-ups</button>
      </div>

      {/* ── TAB 1: Pipeline ── */}
      {tab === 'pipeline' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#444', padding: 60, fontSize: 18 }}>Loading leads...</div>
          ) : (
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12 }}>
              {STATUSES.map((s) => (
                <KanbanColumn
                  key={s}
                  status={s}
                  leads={byStatus(s)}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
          {leads.filter((l) => l.status === 'lost').length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
                Lost Leads ({leads.filter((l) => l.status === 'lost').length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {leads.filter((l) => l.status === 'lost').map((l) => (
                  <div key={l._id} style={{
                    background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 10,
                    padding: '10px 16px', opacity: 0.6, display: 'flex', gap: 12, alignItems: 'center',
                  }}>
                    <span style={{ color: '#fff' }}>{l.name}</span>
                    <span style={{ color: '#555', fontSize: 12 }}>{l.phone}</span>
                    <button onClick={() => handleDelete(l._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── TAB 2: Segments ── */}
      {tab === 'segments' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 20 }}>
            Segments calculated from order history. Use "Create Campaign" to target each group.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {segments.map((seg) => (
              <SegmentCard
                key={seg.key}
                seg={seg}
                onCampaign={() => {
                  window.location.href = `/admin/marketing?segment=${seg.key}`;
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── TAB 3: Follow-ups ── */}
      {tab === 'followups' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {followUpLeads.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#333', padding: 60, fontSize: 18 }}>
              No follow-ups scheduled
            </div>
          ) : (
            <div style={{
              background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 16, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr 2fr auto',
                gap: 16, padding: '14px 20px', borderBottom: '1px solid #1e1e1e',
                color: '#555', fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
              }}>
                <span>Lead Name</span><span>Phone</span><span>Status</span>
                <span>Due Date</span><span>Notes</span><span>Actions</span>
              </div>

              <AnimatePresence>
                {followUpLeads.map((lead, i) => {
                  const badge = getDueBadge(lead.followUpDate!);
                  return (
                    <motion.div
                      key={lead._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr 2fr auto',
                        gap: 16, padding: '16px 20px',
                        borderBottom: '1px solid #141414',
                        alignItems: 'center',
                        borderLeft: `3px solid ${badge.color}`,
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{lead.name}</span>
                      <span style={{ color: '#888', fontSize: 13 }}>{lead.phone}</span>
                      <span style={{
                        display: 'inline-block',
                        background: STATUS_COLORS[lead.status] + '22',
                        color: STATUS_COLORS[lead.status],
                        borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                      }}>{lead.status}</span>
                      <div>
                        <div style={{ color: badge.color, fontSize: 13, fontWeight: 700 }}>
                          {new Date(lead.followUpDate!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                        <div style={{
                          background: badge.color + '22', color: badge.color,
                          borderRadius: 4, padding: '1px 7px', fontSize: 11, fontWeight: 600,
                          display: 'inline-block', marginTop: 2,
                        }}>{badge.label}</div>
                      </div>
                      <span style={{ color: '#555', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.notes || '—'}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleStatusChange(lead._id, 'contacted')}
                          title="Mark Done"
                          style={{
                            background: '#22c55e22', border: '1px solid #22c55e44', color: '#22c55e',
                            borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 13,
                          }}
                        >✓</button>
                        <a
                          href={`tel:${lead.phone}`}
                          title="Call"
                          style={{
                            background: '#3b82f622', border: '1px solid #3b82f644', color: '#3b82f6',
                            borderRadius: 6, padding: '5px 10px', fontSize: 13, textDecoration: 'none',
                          }}
                        >📞</a>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          title="WhatsApp"
                          style={{
                            background: '#22c55e22', border: '1px solid #22c55e44', color: '#22c55e',
                            borderRadius: 6, padding: '5px 10px', fontSize: 13, textDecoration: 'none',
                          }}
                        >💬</a>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <LeadModal
            onClose={() => { setShowModal(false); setEditingLead(undefined); }}
            onSave={handleSaveLead}
            initial={editingLead}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
