'use client';

import { useState, useEffect } from 'react';
import { Search, Edit2 } from 'lucide-react';
import api from '@/services/api';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  restaurantId?: string | null;
  isActive?: boolean;
  createdAt: string;
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; phone: string; role: string; password: string }>({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
  });
  const [saving, setSaving] = useState(false);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const load = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      const data = await api.get<UserRow[]>('/users', { headers: headers(), params });
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await load();
      } catch {
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [search, roleFilter]);

  const roleBadge = (role: string) => {
    const styles: React.CSSProperties =
      role === 'super_admin'
        ? { background: 'rgba(200,151,42,0.15)', color: '#f0c060' }
        : role === 'master_admin'
        ? { background: 'rgba(200,151,42,0.1)', color: '#c8972a' }
        : { background: 'rgba(200,151,42,0.07)', color: '#a89070' };
    return (
      <span
        className="px-2 py-1 rounded text-xs font-medium"
        style={styles}
      >
        {role.replace('_', ' ')}
      </span>
    );
  };

  const openEdit = (user: UserRow) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: '',
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
      };
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }
      await api.put(`/users/${editingUser._id}`, payload, { headers: headers() });
      setEditingUser(null);
      setForm({ name: '', email: '', phone: '', role: 'customer', password: '' });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: '#1c1c1c',
    border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#f8f4ed',
    outline: 'none',
    width: '100%',
    fontSize: '0.875rem',
  };

  const selectStyle: React.CSSProperties = {
    background: '#1c1c1c',
    border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#f8f4ed',
    outline: 'none',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>All Users</h1>
        <p className="text-sm mt-1" style={{ color: '#a89070' }}>Super Admin — every user on the platform (super admin, master admin, restaurants, staff, customers)</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a89070' }} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
            }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="master_admin">Master Admin</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
          <option value="cashier">Cashier</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div
            className="animate-spin rounded-full h-10 w-10 border-2"
            style={{ borderColor: 'rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }}
          />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)' }}>
          <table className="w-full text-sm">
            <thead className="text-left" style={{ background: '#1c1c1c' }}>
              <tr>
                <th className="py-4 px-5 font-semibold" style={{ color: '#a89070' }}>User</th>
                <th className="py-4 px-5 font-semibold" style={{ color: '#a89070' }}>Contact</th>
                <th className="py-4 px-5 font-semibold" style={{ color: '#a89070' }}>Role</th>
                <th className="py-4 px-5 font-semibold" style={{ color: '#a89070' }}>Context</th>
                <th className="py-4 px-5 font-semibold" style={{ color: '#a89070' }}>Created</th>
                <th className="py-4 px-5 font-semibold text-right" style={{ color: '#a89070' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center" style={{ color: '#a89070' }}>No users found</td>
                </tr>
              ) : users.map((u, idx) => (
                <tr
                  key={u._id}
                  style={{
                    background: idx % 2 === 0 ? '#141414' : '#1a1a1a',
                    borderBottom: '1px solid rgba(200,151,42,0.08)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(200,151,42,0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#141414' : '#1a1a1a')}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-semibold"
                        style={{ background: 'rgba(200,151,42,0.15)', color: '#c8972a' }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: '#f8f4ed' }}>{u.name}</div>
                        <div className="text-xs" style={{ color: '#6b5040' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5" style={{ color: '#a89070' }}>{u.phone}</td>
                  <td className="py-4 px-5">{roleBadge(u.role)}</td>
                  <td className="py-4 px-5 text-xs" style={{ color: '#a89070' }}>
                    {u.restaurantId ? `Restaurant: ${u.restaurantId}` : 'Platform'}
                  </td>
                  <td className="py-4 px-5 text-xs" style={{ color: '#a89070' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors"
                      style={{ background: 'rgba(200,151,42,0.1)', color: '#c8972a', border: '1px solid rgba(200,151,42,0.2)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)';
                        e.currentTarget.style.color = '#080808';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(200,151,42,0.1)';
                        e.currentTarget.style.color = '#c8972a';
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editingUser && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => !saving && setEditingUser(null)}
        >
          <div
            className="w-full max-w-md p-6 shadow-2xl"
            style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.2)', borderRadius: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#f8f4ed' }}>Edit user</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#a89070' }}>Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#a89070' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#a89070' }}>Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#a89070' }}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
                  style={{ ...inputStyle }}
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="master_admin">Master Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="cashier">Cashier</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#a89070' }}>New password (optional)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                  style={{ ...inputStyle }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ border: '1px solid rgba(200,151,42,0.3)', color: '#c8972a', background: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(200,151,42,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808', border: 'none' }}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
