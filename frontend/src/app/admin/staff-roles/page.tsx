'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Save, UserCog, Plus, X, Edit2, Trash2, Search, CheckCircle2,
  XCircle, ShieldCheck, Users, ChevronDown, Eye, EyeOff,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/services/api';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const SECTIONS: { key: string; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'menu', label: 'Menu' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'heroImages', label: 'Hero Images' },
  { key: 'billing', label: 'Billing Panel' },
  { key: 'payments', label: 'Payments' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'customers', label: 'Customers' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'analytics', label: 'Analytics' },
];

const STAFF_ROLES = ['manager', 'cashier', 'staff'] as const;
type StaffRole = typeof STAFF_ROLES[number];

const PERM_ROLES = ['staff', 'manager', 'cashier'] as const;

const ROLE_LABELS: Record<string, string> = {
  manager: 'Manager',
  cashier: 'Cashier',
  staff: 'Staff',
  admin: 'Admin',
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  manager: { bg: 'rgba(200,151,42,0.15)', text: '#f0c060', border: 'rgba(200,151,42,0.3)' },
  cashier: { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
  staff: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
  admin: { bg: 'rgba(168,85,247,0.1)', text: '#c084fc', border: 'rgba(168,85,247,0.25)' },
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  staff: 'Basic access — dashboard and orders only.',
  manager: 'Broad access — menu, bookings, customers, reviews, analytics.',
  cashier: 'Finance access — orders, billing, and revenue.',
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: StaffRole;
}

const defaultForm: StaffFormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'staff',
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

function RoleBadge({ role }: { role: string }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.staff;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function StaffRolesPage() {
  const [activeTab, setActiveTab] = useState<'members' | 'permissions'>('members');

  // ── Staff members state ──
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | StaffRole>('all');

  // ── Add/Edit panel ──
  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Delete confirm ──
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Role permissions state ──
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    staff: ['dashboard', 'orders'],
    manager: ['dashboard', 'orders', 'menu', 'bookings', 'customers', 'reviews', 'analytics'],
    cashier: ['dashboard', 'orders', 'billing', 'revenue'],
  });
  const [permsLoading, setPermsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Load on mount ──
  useEffect(() => {
    loadStaff();
    loadPermissions();
  }, []);

  // ─── Staff CRUD ───────────────────────────

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const params: Record<string, string> = {};
      const result = await api.get<StaffMember[]>('/users', { params });
      // Filter to only staff-level roles (exclude admin, customer, super_admin, master_admin)
      const staffOnly = (Array.isArray(result) ? result : []).filter(
        (u) => ['staff', 'manager', 'cashier'].includes(u.role)
      );
      setStaff(staffOnly);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load staff');
    } finally {
      setStaffLoading(false);
    }
  };

  const openAddPanel = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setShowPassword(false);
    setShowPanel(true);
  };

  const openEditPanel = (member: StaffMember) => {
    setEditingId(member._id);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      password: '',
      role: (STAFF_ROLES as readonly string[]).includes(member.role)
        ? (member.role as StaffRole)
        : 'staff',
    });
    setShowPassword(false);
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Name, email, and phone are required');
      return;
    }
    if (!editingId && !formData.password.trim()) {
      toast.error('Password is required for new staff');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const payload: Record<string, string> = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
        };
        if (formData.password.trim()) payload.password = formData.password.trim();
        await api.put(`/users/${editingId}`, payload);
        toast.success('Staff member updated');
      } else {
        await api.post('/users', {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password.trim(),
          role: formData.role,
        });
        toast.success('Staff member added');
      }
      closePanel();
      loadStaff();
    } catch (e: any) {
      toast.error(e?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (member: StaffMember) => {
    try {
      await api.put(`/users/${member._id}`, { isActive: !member.isActive });
      toast.success(member.isActive ? 'Staff disabled' : 'Staff enabled');
      setStaff((prev) =>
        prev.map((m) => (m._id === member._id ? { ...m, isActive: !m.isActive } : m))
      );
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update status');
    }
  };

  const confirmDelete = (id: string) => setDeletingId(id);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/users/${deletingId}`);
      toast.success('Staff member removed');
      setStaff((prev) => prev.filter((m) => m._id !== deletingId));
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Permissions ──────────────────────────

  const loadPermissions = async () => {
    setPermsLoading(true);
    try {
      const res = await api.get<{ rolePermissions?: Record<string, string[]> }>(
        '/restaurants/me/role-permissions'
      );
      const rp = res?.rolePermissions;
      if (rp && typeof rp === 'object') setRolePermissions(rp);
    } catch {}
    finally { setPermsLoading(false); }
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      await api.put('/restaurants/me/role-permissions', { rolePermissions });
      toast.success('Role permissions saved');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (role: string, key: string, checked: boolean) => {
    const perms = rolePermissions[role] || [];
    const next = checked ? [...perms, key] : perms.filter((p) => p !== key);
    setRolePermissions({ ...rolePermissions, [role]: next });
  };

  // ─── Filtered staff list ──────────────────

  const filteredStaff = staff.filter((m) => {
    const matchSearch =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone || '').includes(searchQuery);
    const matchRole = roleFilter === 'all' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div className="space-y-6" style={{ maxWidth: '1100px' }}>
      <Toaster position="top-right" />

      {/* ── Page Header ── */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: '#f8f4ed' }}
          >
            <UserCog className="w-7 h-7" style={{ color: '#c8972a' }} />
            Staff &amp; Roles
          </h1>
          <p className="text-sm mt-1" style={{ color: '#a89070' }}>
            Manage staff members and control what each role can access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: '#1c1c1c',
              color: '#f8f4ed',
              border: '1px solid rgba(200,151,42,0.15)',
            }}
          >
            All Users
          </Link>
          {activeTab === 'members' && (
            <button
              type="button"
              onClick={openAddPanel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                color: '#080808',
                border: 'none',
                borderRadius: '10px',
              }}
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </button>
          )}
          {activeTab === 'permissions' && (
            <button
              type="button"
              onClick={handleSavePermissions}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                color: '#080808',
                border: 'none',
                borderRadius: '10px',
              }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.12)', width: 'fit-content' }}
      >
        {[
          { key: 'members', label: 'Staff Members', icon: Users },
          { key: 'permissions', label: 'Role Permissions', icon: ShieldCheck },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as any)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              activeTab === key
                ? {
                    background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                    color: '#080808',
                    border: 'none',
                  }
                : { background: 'transparent', color: '#a89070', border: 'none' }
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
           TAB: STAFF MEMBERS
         ══════════════════════════════════════ */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px] max-w-xs"
              style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}
            >
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#a89070' }} />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: '#f8f4ed' }}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')}>
                  <X className="w-3.5 h-3.5" style={{ color: '#a89070' }} />
                </button>
              )}
            </div>

            {/* Role filter */}
            <div className="flex items-center gap-2">
              {(['all', ...STAFF_ROLES] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={
                    roleFilter === r
                      ? {
                          background: 'rgba(200,151,42,0.2)',
                          color: '#f0c060',
                          border: '1px solid rgba(200,151,42,0.4)',
                        }
                      : {
                          background: '#141414',
                          color: '#a89070',
                          border: '1px solid rgba(200,151,42,0.1)',
                        }
                  }
                >
                  {r === 'all' ? 'All Roles' : ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Staff table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}
          >
            {staffLoading ? (
              <div className="flex items-center justify-center py-16">
                <div
                  className="animate-spin rounded-full h-10 w-10"
                  style={{
                    border: '3px solid rgba(200,151,42,0.2)',
                    borderTopColor: '#c8972a',
                  }}
                />
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Users className="w-12 h-12" style={{ color: 'rgba(200,151,42,0.3)' }} />
                <p style={{ color: '#a89070' }}>
                  {staff.length === 0
                    ? 'No staff members yet. Add your first staff member.'
                    : 'No staff members match your filters.'}
                </p>
                {staff.length === 0 && (
                  <button
                    type="button"
                    onClick={openAddPanel}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add First Staff
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                      {['Name', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4"
                          style={{
                            background: '#1c1c1c',
                            color: '#a89070',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member) => (
                      <tr
                        key={member._id}
                        style={{
                          borderBottom: '1px solid rgba(200,151,42,0.07)',
                          background: '#141414',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = '#1c1c1c')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = '#141414')
                        }
                      >
                        {/* Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                              style={{
                                background: 'linear-gradient(135deg,#8b5a00,#c8972a)',
                                color: '#080808',
                              }}
                            >
                              {member.name.slice(0, 1).toUpperCase()}
                            </div>
                            <span style={{ color: '#f8f4ed', fontWeight: 500 }}>
                              {member.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4" style={{ color: '#a89070' }}>
                          {member.email}
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4" style={{ color: '#a89070' }}>
                          {member.phone || '—'}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <RoleBadge role={member.role} />
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => toggleActive(member)}
                            className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                            title={member.isActive ? 'Click to disable' : 'Click to enable'}
                          >
                            {member.isActive ? (
                              <>
                                <CheckCircle2
                                  className="w-4 h-4"
                                  style={{ color: '#22c55e' }}
                                />
                                <span style={{ color: '#22c55e' }}>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle
                                  className="w-4 h-4"
                                  style={{ color: '#ef4444' }}
                                />
                                <span style={{ color: '#ef4444' }}>Disabled</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditPanel(member)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{
                                color: '#a89070',
                                background: 'transparent',
                                border: '1px solid rgba(200,151,42,0.15)',
                              }}
                              title="Edit"
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.color = '#f0c060';
                                (e.currentTarget as HTMLElement).style.background =
                                  'rgba(200,151,42,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.color = '#a89070';
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete(member._id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{
                                color: '#a89070',
                                background: 'transparent',
                                border: '1px solid rgba(239,68,68,0.15)',
                              }}
                              title="Delete"
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.color = '#ef4444';
                                (e.currentTarget as HTMLElement).style.background =
                                  'rgba(239,68,68,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.color = '#a89070';
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Staff count */}
          {!staffLoading && staff.length > 0 && (
            <p className="text-xs" style={{ color: '#6b5040' }}>
              Showing {filteredStaff.length} of {staff.length} staff members
            </p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
           TAB: ROLE PERMISSIONS
         ══════════════════════════════════════ */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {/* Role summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PERM_ROLES.map((role) => {
              const perms = rolePermissions[role] || [];
              const c = ROLE_COLORS[role] || ROLE_COLORS.staff;
              return (
                <div
                  key={role}
                  className="rounded-xl p-4"
                  style={{
                    background: '#141414',
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4" style={{ color: c.text }} />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: c.text }}
                    >
                      {ROLE_LABELS[role]}
                    </span>
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full"
                      style={{ background: c.bg, color: c.text }}
                    >
                      {perms.length}/{SECTIONS.length}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#a89070' }}>
                    {ROLE_DESCRIPTIONS[role]}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Permissions matrix */}
          <div
            className="rounded-xl p-6"
            style={{
              background: '#141414',
              border: '1px solid rgba(200,151,42,0.13)',
              borderRadius: '16px',
            }}
          >
            <p className="text-sm mb-4" style={{ color: '#a89070' }}>
              Check the sections each role can access in the Staff Panel. Changes take
              effect immediately after saving.
            </p>

            {permsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div
                  className="animate-spin rounded-full h-8 w-8"
                  style={{
                    border: '3px solid rgba(200,151,42,0.2)',
                    borderTopColor: '#c8972a',
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                      <th
                        className="text-left py-3 px-3"
                        style={{
                          background: '#1c1c1c',
                          color: '#a89070',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Section
                      </th>
                      {PERM_ROLES.map((role) => {
                        const c = ROLE_COLORS[role];
                        return (
                          <th
                            key={role}
                            className="text-left py-3 px-3"
                            style={{
                              background: '#1c1c1c',
                              color: c.text,
                              fontSize: '11px',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {ROLE_LABELS[role]}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {SECTIONS.map(({ key, label }) => (
                      <tr
                        key={key}
                        style={{
                          background: '#141414',
                          borderBottom: '1px solid rgba(200,151,42,0.07)',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = '#1c1c1c')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = '#141414')
                        }
                      >
                        <td
                          className="py-3 px-3"
                          style={{ color: '#f8f4ed' }}
                        >
                          {label}
                        </td>
                        {PERM_ROLES.map((role) => (
                          <td key={role} className="py-3 px-3">
                            <input
                              type="checkbox"
                              checked={(rolePermissions[role] || []).includes(key)}
                              onChange={(e) =>
                                togglePermission(role, key, e.target.checked)
                              }
                              className="w-4 h-4 rounded cursor-pointer"
                              style={{ accentColor: '#c8972a' }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
           ADD / EDIT SIDE PANEL
         ══════════════════════════════════════ */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={closePanel}
          />

          {/* Panel */}
          <div
            className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
            style={{
              width: '420px',
              maxWidth: '100vw',
              background: '#0d0d0d',
              borderLeft: '1px solid rgba(200,151,42,0.2)',
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}
            >
              <h2 className="text-lg font-bold" style={{ color: '#f8f4ed' }}>
                {editingId ? 'Edit Staff Member' : 'Add Staff Member'}
              </h2>
              <button
                type="button"
                onClick={closePanel}
                className="p-1.5 rounded-lg"
                style={{ color: '#a89070', border: 'none', background: 'transparent' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = '#f8f4ed')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = '#a89070')
                }
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel body */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
            >
              {/* Name */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: '#a89070', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: '#1c1c1c',
                    color: '#f8f4ed',
                    border: '1px solid rgba(200,151,42,0.2)',
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.5)')
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.2)')
                  }
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: '#a89070', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="staff@restaurant.com"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    background: '#1c1c1c',
                    color: '#f8f4ed',
                    border: '1px solid rgba(200,151,42,0.2)',
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.5)')
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.2)')
                  }
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: '#a89070', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    background: '#1c1c1c',
                    color: '#f8f4ed',
                    border: '1px solid rgba(200,151,42,0.2)',
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.5)')
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.2)')
                  }
                />
              </div>

              {/* Role */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: '#a89070', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  Role *
                </label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        role: e.target.value as StaffRole,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
                    style={{
                      background: '#1c1c1c',
                      color: '#f8f4ed',
                      border: '1px solid rgba(200,151,42,0.2)',
                    }}
                  >
                    <option value="staff">Staff — Basic access</option>
                    <option value="manager">Manager — Broad access</option>
                    <option value="cashier">Cashier — Finance access</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: '#a89070' }}
                  />
                </div>
                {/* Role description hint */}
                <p className="text-xs mt-1.5" style={{ color: '#6b5040' }}>
                  {ROLE_DESCRIPTIONS[formData.role]}
                </p>
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: '#a89070', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  {editingId ? 'New Password (leave blank to keep)' : 'Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder={editingId ? 'Leave blank to keep current' : 'Min 8 characters'}
                    required={!editingId}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none"
                    style={{
                      background: '#1c1c1c',
                      color: '#f8f4ed',
                      border: '1px solid rgba(200,151,42,0.2)',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.5)')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.border = '1px solid rgba(200,151,42,0.2)')
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#a89070', background: 'none', border: 'none' }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                    color: '#080808',
                    border: 'none',
                  }}
                >
                  {submitting
                    ? editingId
                      ? 'Saving...'
                      : 'Adding...'
                    : editingId
                    ? 'Save Changes'
                    : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
           DELETE CONFIRM DIALOG
         ══════════════════════════════════════ */}
      {deletingId && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setDeletingId(null)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-2xl w-80"
            style={{
              background: '#141414',
              border: '1px solid rgba(239,68,68,0.25)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} />
              <h3 className="text-base font-bold" style={{ color: '#f8f4ed' }}>
                Remove Staff Member
              </h3>
            </div>
            <p className="text-sm mb-5" style={{ color: '#a89070' }}>
              This will permanently remove the staff member. They will lose all access
              immediately.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: '#1c1c1c',
                  color: '#f8f4ed',
                  border: '1px solid rgba(200,151,42,0.15)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2 rounded-lg text-sm font-bold"
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
