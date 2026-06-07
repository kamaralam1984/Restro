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
    <span style={{
      padding: '3px 10px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: role === 'master_admin' ? 'rgba(200,151,42,0.15)' : 'rgba(168,144,112,0.12)',
      color: role === 'master_admin' ? '#f0c060' : '#a89070',
      border: role === 'master_admin' ? '1px solid rgba(200,151,42,0.3)' : '1px solid rgba(168,144,112,0.2)',
      letterSpacing: '0.03em',
      textTransform: 'capitalize' as const,
    }}>
      {role.replace('_', ' ')}
    </span>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Users</h1>
        <p className="text-sm mt-1" style={{ color: '#a89070' }}>Master Admin — all users except Super Admin (master admins, restaurants, staff, customers)</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a89070' }} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
            style={{
              paddingLeft: 40,
              paddingRight: 16,
              paddingTop: 10,
              paddingBottom: 10,
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: 10,
              color: '#f8f4ed',
              outline: 'none',
              fontSize: 14,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#c8972a')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            background: '#1c1c1c',
            border: '1px solid rgba(200,151,42,0.2)',
            borderRadius: 10,
            color: '#f8f4ed',
            outline: 'none',
            fontSize: 14,
            cursor: 'pointer',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#c8972a')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
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
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid rgba(200,151,42,0.2)',
            borderTopColor: '#c8972a',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      ) : (
        <div style={{ background: '#141414', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(200,151,42,0.13)' }}>
          <table className="w-full text-sm">
            <thead style={{ background: '#1c1c1c' }} className="text-left">
              <tr>
                <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>User</th>
                <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Contact</th>
                <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Role</th>
                <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Context</th>
                <th className="py-4 px-5" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center" style={{ color: '#a89070' }}>No users found</td></tr>
              ) : users.map((u) => (
                <tr
                  key={u._id}
                  style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1c1c1c')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#141414')}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold" style={{ background: 'rgba(200,151,42,0.15)', color: '#f0c060' }}>
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
                  <td className="py-4 px-5 text-xs" style={{ color: '#6b5040' }}>
                    {u.restaurantId ? `Restaurant: ${u.restaurantId}` : 'Platform'}
                  </td>
                  <td className="py-4 px-5 text-xs" style={{ color: '#6b5040' }}>
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
