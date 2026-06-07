'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UserPlus, X, Save, Shield, User, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'staff';
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin' | 'staff'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer' as 'customer' | 'admin' | 'staff',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const params: any = {};
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get<UserData[]>('/users', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setUsers(Array.isArray(response) ? response : []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, roleFilter]);

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'customer',
    });
    setShowModal(true);
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('User deleted successfully');
      loadUsers();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (editingUser) {
        // Update user
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        };

        // Only include password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        await api.put(`/users/${editingUser._id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('User updated successfully');
      } else {
        // Create user
        const createData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        };

        // Only include password if provided
        if (formData.password) {
          createData.password = formData.password;
        }

        await api.post('/users', createData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('User created successfully');
      }

      setShowModal(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error?.message || editingUser ? 'Failed to update user' : 'Failed to create user');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" style={{ color: '#ef4444' }} />;
      case 'staff':
        return <Users className="w-4 h-4" style={{ color: '#60a5fa' }} />;
      default:
        return <User className="w-4 h-4" style={{ color: '#22c55e' }} />;
    }
  };

  const getRoleBadgeStyle = (role: string): React.CSSProperties => {
    switch (role) {
      case 'admin':
        return { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' };
      case 'staff':
        return { background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' };
      default:
        return { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' };
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const inputStyle: React.CSSProperties = {
    background: '#1c1c1c',
    border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#f8f4ed',
    outline: 'none',
    width: '100%',
  };

  return (
    <div className="space-y-6" style={{ background: '#080808', minHeight: '100%' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>User Management</h1>
          <p className="text-sm mt-1" style={{ color: '#a89070' }}>
            Total Users: {users.length} | Showing: {filteredUsers.length}
          </p>
        </div>
        <motion.button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{
            background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
            color: '#080808',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <UserPlus className="w-5 h-5" />
          <span>Create User</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4 space-y-4"
        style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}
      >
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: '#a89070' }}
            />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...inputStyle,
                paddingLeft: '40px',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            style={{
              background: '#1c1c1c',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#f8f4ed',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
          >
            <option value="all" style={{ background: '#1c1c1c' }}>All Roles</option>
            <option value="customer" style={{ background: '#1c1c1c' }}>Customer</option>
            <option value="staff" style={{ background: '#1c1c1c' }}>Staff</option>
            <option value="admin" style={{ background: '#1c1c1c' }}>Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12" style={{ color: '#a89070' }}>Loading...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#a89070' }}>No users found</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: '#1c1c1c' }}>
                <tr>
                  <th
                    className="text-left py-4 px-6"
                    style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >User</th>
                  <th
                    className="text-left py-4 px-6"
                    style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >Contact</th>
                  <th
                    className="text-left py-4 px-6"
                    style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >Role</th>
                  <th
                    className="text-left py-4 px-6"
                    style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >Created</th>
                  <th
                    className="text-right py-4 px-6"
                    style={{ color: '#a89070', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background = '#1c1c1c')}
                    onMouseLeave={(e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.background = '#141414')}
                    className="transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                          style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a)', color: '#080808' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#f8f4ed' }}>{user.name}</p>
                          <p className="text-xs" style={{ color: '#a89070' }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm" style={{ color: '#a89070' }}>{user.phone}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={getRoleBadgeStyle(user.role)}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm" style={{ color: '#a89070' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          onClick={() => handleEdit(user)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#60a5fa' }}
                          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(96,165,250,0.1)')}
                          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'transparent')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(user._id, user.name)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#ef4444' }}
                          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'transparent')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <motion.div
              className="w-full max-w-md"
              style={{
                background: '#141414',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: '18px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div
                className="p-6 flex justify-between items-center"
                style={{ borderBottom: '1px solid rgba(200,151,42,0.15)' }}
              >
                <h2 className="text-xl font-bold" style={{ color: '#f8f4ed' }}>
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="transition-colors"
                  style={{ color: '#a89070' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f8f4ed')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#a89070')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={inputStyle}
                    placeholder="John Doe"
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                    placeholder="user@example.com"
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={inputStyle}
                    placeholder="+1234567890"
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as any })
                    }
                    style={{
                      background: '#1c1c1c',
                      border: '1px solid rgba(200,151,42,0.2)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: '#f8f4ed',
                      outline: 'none',
                      width: '100%',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                  >
                    <option value="customer" style={{ background: '#1c1c1c' }}>Customer</option>
                    <option value="staff" style={{ background: '#1c1c1c' }}>Staff</option>
                    <option value="admin" style={{ background: '#1c1c1c' }}>Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={inputStyle}
                    placeholder={editingUser ? 'Enter new password' : 'Password123'}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                  />
                  {!editingUser && (
                    <p className="text-xs mt-1" style={{ color: '#6b5040' }}>
                      Default: Password123 (if not provided)
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg transition-colors"
                    style={{
                      border: '1px solid rgba(200,151,42,0.3)',
                      color: '#c8972a',
                      background: 'transparent',
                      borderRadius: '10px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(200,151,42,0.07)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 700,
                    }}
                  >
                    <Save className="w-4 h-4" />
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
