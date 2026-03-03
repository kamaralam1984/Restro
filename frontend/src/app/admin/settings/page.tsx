'use client';

import { useState, useEffect } from 'react';
import { Save, Bell, CreditCard, Globe, Shield, Palette, Check, Eye, EyeOff, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/services/api';
import { WEBSITE_THEMES, DEFAULT_THEME_ID, getThemeById } from '@/config/websiteThemes';

interface RestaurantSettings {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  currency: string;
  taxRate: number;
  serviceCharge: number;
  primaryColor: string;
  theme: string;
  logo: string;
  description: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  whatsappNumber: string;
  notificationEmail: string;
  enableNotifications?: boolean;
  enableWhatsApp?: boolean;
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  currency: 'INR',
  taxRate: 5,
  serviceCharge: 0,
  primaryColor: '#ea580c',
  theme: DEFAULT_THEME_ID,
  logo: '',
  description: '',
  razorpayKeyId: '',
  razorpayKeySecret: '',
  whatsappNumber: '',
  notificationEmail: '',
  enableNotifications: true,
  enableWhatsApp: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'website' | 'payment' | 'notifications' | 'security'>('general');
  // Rental admin: change own password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await api.get<any>('/restaurants/me', { headers: { Authorization: `Bearer ${token}` } });
      const rolePerms = await api.get<{ rolePermissions?: Record<string, string[]> }>('/restaurants/me/role-permissions', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({} as { rolePermissions?: Record<string, string[]> }));
      if (rolePerms && 'rolePermissions' in rolePerms && typeof rolePerms.rolePermissions === 'object') {
        setRolePermissions(rolePerms.rolePermissions);
      }
      const themeId = data.theme && WEBSITE_THEMES.some((t) => t.id === data.theme) ? data.theme : DEFAULT_THEME_ID;
      const theme = getThemeById(themeId);
      setSettings({
        name: data.name ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        pincode: data.pincode ?? '',
        currency: data.currency ?? 'INR',
        taxRate: data.taxRate ?? 5,
        serviceCharge: data.serviceCharge ?? 0,
        primaryColor: data.primaryColor ?? theme?.primary ?? '#ea580c',
        theme: themeId,
        logo: data.logo ?? '',
        description: data.description ?? '',
        razorpayKeyId: data.razorpayKeyId ?? '',
        razorpayKeySecret: data.razorpayKeySecret ?? '',
        whatsappNumber: data.whatsappNumber ?? '',
        notificationEmail: data.notificationEmail ?? '',
        enableNotifications: true,
        enableWhatsApp: !!data.whatsappNumber,
      });
    } catch {
      toast.error('Failed to load restaurant settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const themeObj = getThemeById(settings.theme);
      const payload: Record<string, unknown> = {
        name: settings.name,
        phone: settings.phone,
        address: settings.address,
        city: settings.city,
        state: settings.state,
        pincode: settings.pincode,
        currency: settings.currency,
        taxRate: settings.taxRate,
        serviceCharge: settings.serviceCharge,
        theme: settings.theme,
        primaryColor: themeObj?.primary ?? settings.primaryColor,
        logo: settings.logo || undefined,
        description: settings.description || undefined,
        razorpayKeyId: settings.razorpayKeyId || undefined,
        razorpayKeySecret: settings.razorpayKeySecret || undefined,
        whatsappNumber: settings.whatsappNumber || undefined,
        notificationEmail: settings.notificationEmail || undefined,
      };
      await api.put('/restaurants/me', payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Settings saved successfully');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    if (!currentPassword) {
      toast.error('Enter your current password');
      return;
    }
    setChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await api.put(
        '/auth/me/password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Password updated successfully. Use the new password for next login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'website', label: 'Website / Front page', icon: Palette },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'staffRoles', label: 'Staff role access', icon: UserCog },
    { id: 'security', label: 'Security', icon: Shield },
  ];

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
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 rounded-xl p-2 flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <motion.div
          className="bg-slate-900 rounded-xl p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">General Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Service Charge (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.serviceCharge}
                onChange={(e) => setSettings({ ...settings, serviceCharge: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
              <input type="text" value={settings.city} onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
              <input type="text" value={settings.state} onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pincode</label>
              <input type="text" value={settings.pincode} onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Website / Front page design */}
      {activeTab === 'website' && (
        <motion.div
          className="bg-slate-900 rounded-xl p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-orange-400" />
            Website &amp; Front Page Design
          </h2>
          <p className="text-slate-400 text-sm">Customize how your storefront and homepage look to customers.</p>

          {/* 15 Theme selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Choose a theme (15 options)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {WEBSITE_THEMES.map((theme) => {
                const isSelected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, theme: theme.id, primaryColor: theme.primary })}
                    className={`relative rounded-xl border-2 p-3 text-left transition-all hover:scale-[1.02] ${
                      isSelected
                        ? 'border-orange-500 bg-slate-800 ring-2 ring-orange-500/50'
                        : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                    <div className="flex gap-1 mb-2">
                      {theme.preview.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 h-6 rounded-md border border-slate-600"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-white text-xs font-medium truncate">{theme.name}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-slate-500 text-xs mt-2">Selected: {getThemeById(settings.theme)?.name ?? 'Classic Orange'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Primary / Brand Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-slate-600 bg-slate-800"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">Overrides theme color if you need a custom shade</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Logo URL</label>
              <input
                type="url"
                value={settings.logo}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-slate-500 text-xs mt-1">Image URL for your restaurant logo</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description / Tagline</label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={3}
                placeholder="Short description or tagline for your homepage / hero section"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <motion.div
          className="bg-slate-900 rounded-xl p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Payment Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Razorpay Key ID
              </label>
              <input
                type="text"
                value={settings.razorpayKeyId}
                onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="rzp_test_..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Razorpay Key Secret
              </label>
              <input
                type="password"
                value={settings.razorpayKeySecret}
                onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <motion.div
          className="bg-slate-900 rounded-xl p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Notification Settings</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-slate-400">Receive email alerts for new orders & bills</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Notification email (restaurant)
                </label>
                <input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                  placeholder="owner@yourrestaurant.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="+919876543210"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-slate-500 text-xs mt-1">For order/booking notifications</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Staff role access — which sections each role can see in Staff Panel */}
      {activeTab === 'staffRoles' && (
        <motion.div
          className="bg-slate-900 rounded-xl p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-white mb-2">Staff role access</h2>
          <p className="text-slate-400 text-sm mb-4">
            Choose which sections each staff role can see in the Staff Panel. Staff, Manager, and Cashier log in to the Staff Panel (not the full Admin Panel). Admin always has full access.
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
                {[
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
                ].map(({ key, label }) => (
                  <tr key={key} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-2 text-white">{label}</td>
                    {(['staff', 'manager', 'cashier'] as const).map((role) => (
                      <td key={role} className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={(rolePermissions[role] || []).includes(key)}
                          onChange={(e) => {
                            const perms = rolePermissions[role] || [];
                            const next = e.target.checked
                              ? [...perms, key]
                              : perms.filter((p) => p !== key);
                            setRolePermissions({ ...rolePermissions, [role]: next });
                          }}
                          className="w-4 h-4 rounded border-slate-600 text-orange-600 focus:ring-orange-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={async () => {
              setSavingRolePerms(true);
              try {
                const token = localStorage.getItem('token');
                await api.put('/restaurants/me/role-permissions', { rolePermissions }, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Staff role access updated');
              } catch (e: any) {
                toast.error(e?.response?.data?.error || e?.message || 'Failed to save');
              } finally {
                setSavingRolePerms(false);
              }
            }}
            disabled={savingRolePerms}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {savingRolePerms ? 'Saving...' : 'Save role access'}
          </button>
        </motion.div>
      )}

      {/* Security Settings — Rental Admin: change own login password */}
      {activeTab === 'security' && (
        <motion.div
          className="bg-slate-900 rounded-xl p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
          <p className="text-slate-400 text-sm mb-4">
            Change your rental admin panel login password here. Your login ID (email) is set by the platform; only the password can be updated from this panel.
          </p>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New password</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {changingPassword ? (
                <span className="animate-pulse">Updating…</span>
              ) : (
                <>
                  <Shield size={18} />
                  Update password
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
