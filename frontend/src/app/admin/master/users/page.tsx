'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '@/services/api';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  restaurantId?: string | null;
  createdAt: string;
}

export default function MasterAdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
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
    load();
  }, [search, roleFilter]);

  const roleBadge = (role: string) => (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      role === 'master_admin' ? 'bg-amber-600/30 text-amber-300' : 'bg-slate-600/30 text-slate-300'
    }`}>
      {role.replace('_', ' ')}
    </span>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-slate-400 text-sm mt-1">Master Admin — all users except Super Admin (master admins, restaurants, staff, customers)</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All roles</option>
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
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-600 border-t-transparent" />
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
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-600/20 rounded-full flex items-center justify-center text-amber-300 font-semibold">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
