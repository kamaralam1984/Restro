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
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        role === 'super_admin' ? 'bg-purple-600/30 text-purple-300' :
        role === 'master_admin' ? 'bg-amber-600/30 text-amber-300' :
        'bg-slate-600/30 text-slate-300'
      }`}>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Users</h1>
        <p className="text-slate-400 text-sm mt-1">Super Admin — every user on the platform (super admin, master admin, restaurants, staff, customers)</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
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
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-left">
              <tr>
                <th className="py-4 px-5 text-slate-300 font-semibold">User</th>
                <th className="py-4 px-5 text-slate-300 font-semibold">Contact</th>
                <th className="py-4 px-5 text-slate-300 font-semibold">Role</th>
                <th className="py-4 px-5 text-slate-300 font-semibold">Context</th>
                <th className="py-4 px-5 text-slate-300 font-semibold">Created</th>
                <th className="py-4 px-5 text-slate-300 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-300 font-semibold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{u.name}</div>
                        <div className="text-slate-500 text-xs">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-300">{u.phone}</td>
                  <td className="py-4 px-5">{roleBadge(u.role)}</td>
                  <td className="py-4 px-5 text-slate-400 text-xs">
                    {u.restaurantId ? `Restaurant: ${u.restaurantId}` : 'Platform'}
                  </td>
                  <td className="py-4 px-5 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 text-xs hover:bg-purple-600/80 hover:text-white transition-colors"
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4" onClick={() => !saving && setEditingUser(null)}>
          <div
            className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Edit user</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
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
                <label className="block text-xs text-slate-400 mb-1">New password (optional)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-500 disabled:opacity-50"
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
