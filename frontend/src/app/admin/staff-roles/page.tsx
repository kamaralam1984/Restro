'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, UserCog } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/services/api';

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

const ROLES = ['staff', 'manager', 'cashier'] as const;

export default function StaffRolesPage() {
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    staff: ['dashboard', 'orders'],
    manager: ['dashboard', 'orders', 'menu', 'bookings', 'customers', 'reviews', 'analytics'],
    cashier: ['dashboard', 'orders', 'billing', 'revenue'],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api
      .get<{ rolePermissions?: Record<string, string[]> }>('/restaurants/me/role-permissions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const rp = res?.rolePermissions;
        if (rp && typeof rp === 'object') setRolePermissions(rp);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await api.put('/restaurants/me/role-permissions', { rolePermissions }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Staff role access saved');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (role: string, key: string, checked: boolean) => {
    const perms = rolePermissions[role] || [];
    const next = checked ? [...perms, key] : perms.filter((p) => p !== key);
    setRolePermissions({ ...rolePermissions, [role]: next });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCog className="w-7 h-7 text-orange-500" />
            Staff roles
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Set which sections each role can see in the Staff Panel. Assign roles to staff from Staff & Users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Staff & Users
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <p className="text-slate-400 text-sm mb-4">
          All roles (Staff, Manager, Cashier) are listed below. Check the sections each role can access in the Staff Panel. 
          Restaurant admin can assign any of these roles to staff from <Link href="/admin/users" className="text-orange-400 hover:text-orange-300">Staff & Users</Link>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-3 px-2 font-medium">Section</th>
                <th className="text-left py-3 px-2 font-medium">Staff</th>
                <th className="text-left py-3 px-2 font-medium">Manager</th>
                <th className="text-left py-3 px-2 font-medium">Cashier</th>
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map(({ key, label }) => (
                <tr key={key} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-3 px-2 text-white">{label}</td>
                  {ROLES.map((role) => (
                    <td key={role} className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={(rolePermissions[role] || []).includes(key)}
                        onChange={(e) => togglePermission(role, key, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
