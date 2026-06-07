'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Check, Star, Plus, X } from 'lucide-react';
import api from '@/services/api';

interface PlanFeatures {
  maxMenuItems: number;
  maxStaff: number;
  maxTables: number;
  onlineOrdering: boolean;
  tableBooking: boolean;
  billing: boolean;
  analytics: boolean;
  staffControl: boolean;
  customDomain: boolean;
  whatsappIntegration: boolean;
  razorpayIntegration: boolean;
  emailSupport: boolean;
}

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  trialDays: number;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  features: PlanFeatures;
}

type PlanForm = Omit<Plan, '_id'>;

const defaultFeatures: PlanFeatures = {
  maxMenuItems: 50,
  maxStaff: 3,
  maxTables: 10,
  onlineOrdering: true,
  tableBooking: false,
  billing: false,
  analytics: false,
  staffControl: false,
  customDomain: false,
  whatsappIntegration: false,
  razorpayIntegration: true,
  emailSupport: true,
};

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PlanForm>({
    name: '',
    description: '',
    price: 0,
    yearlyPrice: 0,
    trialDays: 14,
    isActive: true,
    isPopular: false,
    sortOrder: 0,
    features: defaultFeatures,
  });

  useEffect(() => {
    loadPlans().catch(() => setLoading(false));
  }, []);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const loadPlans = async () => {
    const data = await api.get<Plan[]>('/super-admin/plans', { headers: headers() });
    setPlans(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await api.put(`/super-admin/plans/${id}`, { isActive: !current }, { headers: headers() });
      setPlans((prev) => prev.map((p) => (p._id === id ? { ...p, isActive: !current } : p)));
    } catch {
      // ignore
    }
  };

  const fmt = (n: number) => (n === -1 ? 'Unlimited' : n.toString());
  const featureRows = (f: Plan['features']) => [
    { label: 'Menu Items', value: fmt(f.maxMenuItems) },
    { label: 'Staff Members', value: fmt(f.maxStaff) },
    { label: 'Tables', value: fmt(f.maxTables) },
    { label: 'Online Ordering', value: f.onlineOrdering },
    { label: 'Table Booking', value: f.tableBooking },
    { label: 'Billing', value: f.billing },
    { label: 'Analytics', value: f.analytics },
    { label: 'Staff Control', value: f.staffControl },
    { label: 'Custom Domain', value: f.customDomain },
    { label: 'WhatsApp Integration', value: f.whatsappIntegration },
    { label: 'Razorpay Payments', value: f.razorpayIntegration },
    { label: 'Email Support', value: f.emailSupport },
  ];

  const openNew = () => {
    setIsNew(true);
    setEditing(null);
    setForm({
      name: '',
      description: '',
      price: 999,
      yearlyPrice: 9999,
      trialDays: 14,
      isActive: true,
      isPopular: false,
      sortOrder: plans.length + 1,
      features: { ...defaultFeatures },
    });
  };

  const openEdit = (plan: Plan) => {
    setIsNew(false);
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      yearlyPrice: plan.yearlyPrice,
      trialDays: plan.trialDays,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      sortOrder: plan.sortOrder,
      features: { ...plan.features },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Omit<PlanForm, 'sortOrder'> & { sortOrder?: number } = {
        ...form,
        sortOrder: form.sortOrder,
      };
      if (isNew || !editing) {
        await api.post('/super-admin/plans', payload, { headers: headers() });
      } else {
        await api.put(`/super-admin/plans/${editing._id}`, payload, { headers: headers() });
      }
      setEditing(null);
      setIsNew(false);
      await loadPlans();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: '#1c1c1c',
    border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#f8f4ed',
    outline: 'none',
    width: '100%',
  } as React.CSSProperties;

  const inputSmallStyle = {
    background: '#1c1c1c',
    border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: '8px',
    padding: '6px 10px',
    color: '#f8f4ed',
    outline: 'none',
    width: '100%',
    fontSize: '12px',
  } as React.CSSProperties;

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderTopColor: '#c8972a', borderColor: 'transparent', borderTopWidth: '2px', borderStyle: 'solid' }}
        />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Subscription Plans</h1>
          <p className="text-sm mt-1" style={{ color: '#a89070' }}>
            Platform-level pricing plans — control what each restaurant gets.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{
            background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
            color: '#080808',
            border: 'none',
          }}
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.sort((a, b) => a.sortOrder - b.sortOrder).map((plan, i) => (
          <motion.div
            key={plan._id}
            className="rounded-2xl overflow-hidden transition-all"
            style={{
              background: '#141414',
              border: plan.isPopular
                ? '2px solid rgba(200,151,42,0.6)'
                : '2px solid rgba(200,151,42,0.15)',
              opacity: !plan.isActive ? 0.6 : 1,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {plan.isPopular && (
              <div
                className="text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1"
                style={{
                  background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                  color: '#080808',
                }}
              >
                <Star className="w-3.5 h-3.5" /> MOST POPULAR
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(200,151,42,0.12)' }}
                  >
                    <Package className="w-4 h-4" style={{ color: '#c8972a' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#f8f4ed' }}>{plan.name}</h3>
                    <p className="text-[11px]" style={{ color: '#6b5040' }}>Sort order: {plan.sortOrder}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => toggleActive(plan._id, plan.isActive)}
                    className="text-xs px-2.5 py-1 rounded-full font-semibold transition-colors"
                    style={
                      plan.isActive
                        ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                        : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                    }
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(plan)}
                    className="text-[11px] px-2 py-1 rounded-lg transition-colors"
                    style={{
                      background: '#1c1c1c',
                      color: '#c8972a',
                      border: '1px solid rgba(200,151,42,0.3)',
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
              <p className="text-xs mb-4" style={{ color: '#a89070' }}>{plan.description}</p>

              <div className="mb-4">
                <span className="text-3xl font-bold" style={{ color: '#f8f4ed' }}>₹{plan.price}</span>
                <span className="text-sm" style={{ color: '#a89070' }}>/month</span>
                <div className="text-xs mt-0.5" style={{ color: '#6b5040' }}>₹{plan.yearlyPrice}/year • {plan.trialDays} day trial</div>
              </div>

              <div className="space-y-2">
                {featureRows(plan.features).map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between text-sm"
                    style={{ borderBottom: '1px solid rgba(200,151,42,0.08)', paddingBottom: '4px' }}
                  >
                    <span style={{ color: '#a89070' }}>{row.label}</span>
                    {typeof row.value === 'boolean' ? (
                      <span style={{ color: row.value ? '#22c55e' : '#ef4444' }}>
                        {row.value ? <Check className="w-4 h-4" /> : '✕'}
                      </span>
                    ) : (
                      <span className="font-medium" style={{ color: '#f8f4ed' }}>{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {editing || isNew ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => !saving && (setEditing(null), setIsNew(false))}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
            style={{
              background: '#141414',
              border: '1px solid rgba(200,151,42,0.2)',
              borderRadius: '18px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: '#f8f4ed' }}>
                {isNew ? 'Add Plan' : 'Edit Plan'}
              </h2>
              <button
                type="button"
                onClick={() => !saving && (setEditing(null), setIsNew(false))}
                className="p-1 rounded-lg transition-colors"
                style={{ color: '#a89070', background: 'transparent' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
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
                  <label className="block text-xs mb-1" style={{ color: '#a89070' }}>Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#a89070' }}>Price/month (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) || 0 }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#a89070' }}>Price/year (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.yearlyPrice}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, yearlyPrice: Number(e.target.value) || 0 }))
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#a89070' }}>Trial days</label>
                    <input
                      type="number"
                      min={0}
                      value={form.trialDays}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, trialDays: Number(e.target.value) || 0 }))
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#a89070' }}>Sort order</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, sortOrder: Number(e.target.value) || 0 }))
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#a89070' }}>
                    <input
                      type="checkbox"
                      checked={form.isPopular}
                      onChange={(e) => setForm((s) => ({ ...s, isPopular: e.target.checked }))}
                      className="rounded"
                      style={{ accentColor: '#c8972a' }}
                    />
                    Most popular badge
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#a89070' }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                      className="rounded"
                      style={{ accentColor: '#c8972a' }}
                    />
                    Active (visible)
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs mb-1" style={{ color: '#a89070' }}>Features</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'onlineOrdering' as const, label: 'Online Ordering' },
                    { key: 'tableBooking' as const, label: 'Table Booking' },
                    { key: 'billing' as const, label: 'Billing' },
                    { key: 'analytics' as const, label: 'Analytics' },
                    { key: 'staffControl' as const, label: 'Staff Control' },
                    { key: 'customDomain' as const, label: 'Custom Domain' },
                    { key: 'whatsappIntegration' as const, label: 'WhatsApp' },
                    { key: 'razorpayIntegration' as const, label: 'Razorpay' },
                    { key: 'emailSupport' as const, label: 'Email Support' },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer"
                      style={{ color: '#a89070' }}
                    >
                      <input
                        type="checkbox"
                        checked={form.features[key]}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            features: { ...s.features, [key]: e.target.checked },
                          }))
                        }
                        className="rounded"
                        style={{ accentColor: '#c8972a' }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] mb-1" style={{ color: '#a89070' }}>Menu items</label>
                    <input
                      type="number"
                      value={form.features.maxMenuItems}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          features: {
                            ...s.features,
                            maxMenuItems: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      style={inputSmallStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1" style={{ color: '#a89070' }}>Staff</label>
                    <input
                      type="number"
                      value={form.features.maxStaff}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          features: { ...s.features, maxStaff: Number(e.target.value) || 0 },
                        }))
                      }
                      style={inputSmallStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1" style={{ color: '#a89070' }}>Tables</label>
                    <input
                      type="number"
                      value={form.features.maxTables}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          features: { ...s.features, maxTables: Number(e.target.value) || 0 },
                        }))
                      }
                      style={inputSmallStyle}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setEditing(null);
                  setIsNew(false);
                }}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(200,151,42,0.3)',
                  color: '#c8972a',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
                style={{
                  background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                  color: '#080808',
                  border: 'none',
                }}
              >
                {saving ? 'Saving...' : 'Save plan'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
