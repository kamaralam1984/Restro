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

const inputStyle: React.CSSProperties = {
  background: '#1c1c1c',
  border: '1px solid rgba(200,151,42,0.2)',
  borderRadius: 10,
  padding: '10px 14px',
  color: '#f8f4ed',
  outline: 'none',
  width: '100%',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'website' | 'payment' | 'notifications' | 'security' | 'staffRoles'>('general');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({ staff: ['dashboard', 'orders'], manager: ['dashboard', 'orders', 'menu', 'bookings', 'customers', 'reviews', 'analytics'], cashier: ['dashboard', 'orders', 'billing', 'revenue'] });
  const [savingRolePerms, setSavingRolePerms] = useState(false);
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
        <div
          className="animate-spin rounded-full h-10 w-10"
          style={{ border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ background: '#080808', minHeight: '100%' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
            color: '#080808',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div
        className="rounded-xl p-2 flex gap-2 flex-wrap"
        style={{ background: '#0d0d0d', border: '1px solid rgba(200,151,42,0.13)' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                      color: '#080808',
                      fontWeight: 700,
                      borderRadius: 10,
                    }
                  : {
                      color: '#a89070',
                      background: 'transparent',
                      borderRadius: 10,
                    }
              }
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
          className="rounded-xl p-6 space-y-6"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: 16 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>General Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                Restaurant Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                Phone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                Service Charge (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.serviceCharge}
                onChange={(e) => setSettings({ ...settings, serviceCharge: parseFloat(e.target.value) })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>City</label>
              <input type="text" value={settings.city} onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>State</label>
              <input type="text" value={settings.state} onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>Pincode</label>
              <input type="text" value={settings.pincode} onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Website / Front page design */}
      {activeTab === 'website' && (
        <motion.div
          className="rounded-xl p-6 space-y-6"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: 16 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#f8f4ed', fontWeight: 800 }}>
            <Palette className="w-5 h-5" style={{ color: '#c8972a' }} />
            Website &amp; Front Page Design
          </h2>
          <p className="text-sm" style={{ color: '#a89070' }}>Customize how your storefront and homepage look to customers.</p>

          {/* 15 Theme selection */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#a89070' }}>Choose a theme (15 options)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {WEBSITE_THEMES.map((theme) => {
                const isSelected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, theme: theme.id, primaryColor: theme.primary })}
                    className="relative rounded-xl p-3 text-left transition-all hover:scale-[1.02]"
                    style={{
                      border: isSelected ? '2px solid #c8972a' : '2px solid rgba(200,151,42,0.15)',
                      background: isSelected ? '#1c1c1c' : 'rgba(20,20,20,0.8)',
                      boxShadow: isSelected ? '0 0 0 2px rgba(200,151,42,0.3)' : 'none',
                    }}
                  >
                    {isSelected && (
                      <span
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: '#c8972a' }}
                      >
                        <Check className="w-3 h-3" style={{ color: '#080808' }} />
                      </span>
                    )}
                    <div className="flex gap-1 mb-2">
                      {theme.preview.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 h-6 rounded-md"
                          style={{ backgroundColor: color, border: '1px solid rgba(200,151,42,0.15)' }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium truncate" style={{ color: '#f8f4ed' }}>{theme.name}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-2" style={{ color: '#6b5040' }}>Selected: {getThemeById(settings.theme)?.name ?? 'Classic Orange'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>Primary / Brand Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                  style={{ border: '1px solid rgba(200,151,42,0.2)', background: '#1c1c1c' }}
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 14 }}
                  onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: '#6b5040' }}>Overrides theme color if you need a custom shade</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>Logo URL</label>
              <input
                type="url"
                value={settings.logo}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                placeholder="https://..."
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
              <p className="text-xs mt-1" style={{ color: '#6b5040' }}>Image URL for your restaurant logo</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>Description / Tagline</label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={3}
                placeholder="Short description or tagline for your homepage / hero section"
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <motion.div
          className="rounded-xl p-6 space-y-6"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: 16 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Payment Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                Razorpay Key ID
              </label>
              <input
                type="text"
                value={settings.razorpayKeyId}
                onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                style={inputStyle}
                placeholder="rzp_test_..."
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                Razorpay Key Secret
              </label>
              <input
                type="password"
                value={settings.razorpayKeySecret}
                onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                style={inputStyle}
                placeholder="••••••••"
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <motion.div
          className="rounded-xl p-6 space-y-6"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: 16 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Notification Settings</h2>

          <div className="space-y-4">
            <div
              className="p-4 rounded-lg space-y-3"
              style={{ background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.13)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: '#f8f4ed' }}>Email Notifications</p>
                  <p className="text-sm" style={{ color: '#a89070' }}>Receive email alerts for new orders &amp; bills</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: '#c8972a' }}
                />
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#a89070', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Notification email (restaurant)
                </label>
                <input
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                  placeholder="owner@yourrestaurant.com"
                  style={{ ...inputStyle, fontSize: 14 }}
                  onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="+919876543210"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
              <p className="text-xs mt-1" style={{ color: '#6b5040' }}>For order/booking notifications</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Staff role access — which sections each role can see in Staff Panel */}
      {activeTab === 'staffRoles' && (
        <motion.div
          className="rounded-xl p-6 space-y-6"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: 16 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#f8f4ed', fontWeight: 800 }}>Staff role access</h2>
          <p className="text-sm mb-4" style={{ color: '#a89070' }}>
            Choose which sections each staff role can see in the Staff Panel. Staff, Manager, and Cashier log in to the Staff Panel (not the full Admin Panel). Admin always has full access.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1c1c1c', borderBottom: '1px solid rgba(200,151,42,0.15)' }}>
                  <th className="text-left py-3 px-2 font-medium" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Section</th>
                  <th className="text-left py-3 px-2 font-medium" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Staff</th>
                  <th className="text-left py-3 px-2 font-medium" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Manager</th>
                  <th className="text-left py-3 px-2 font-medium" style={{ color: '#a89070', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cashier</th>
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
                  <tr
                    key={key}
                    style={{ background: '#141414', borderBottom: '1px solid rgba(200,151,42,0.07)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1c1c1c')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#141414')}
                  >
                    <td className="py-3 px-2" style={{ color: '#f8f4ed' }}>{label}</td>
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
                          className="w-4 h-4 rounded"
                          style={{ accentColor: '#c8972a' }}
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
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
              color: '#080808',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            {savingRolePerms ? 'Saving...' : 'Save role access'}
          </button>
        </motion.div>
      )}

      {/* Security Settings — Rental Admin: change own login password */}
      {activeTab === 'security' && (
        <motion.div
          className="rounded-xl p-6 space-y-6"
          style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.13)', borderRadius: 16 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#f8f4ed', fontWeight: 800 }}>Security Settings</h2>
          <p className="text-sm mb-4" style={{ color: '#a89070' }}>
            Change your rental admin panel login password here. Your login ID (email) is set by the platform; only the password can be updated from this panel.
          </p>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>Current password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#6b5040' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f8f4ed')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#6b5040')}
                >
                  {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>New password</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#6b5040' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f8f4ed')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#6b5040')}
                >
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a89070' }}>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c8972a')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(200,151,42,0.2)')}
              />
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                color: '#080808',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
              }}
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
