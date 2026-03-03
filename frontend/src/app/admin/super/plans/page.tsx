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

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
          <p className="text-slate-400 text-sm mt-1">
            Platform-level pricing plans — control what each restaurant gets.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.sort((a, b) => a.sortOrder - b.sortOrder).map((plan, i) => (
          <motion.div
            key={plan._id}
            className={`bg-slate-900 rounded-2xl overflow-hidden border-2 transition-all ${
              plan.isPopular ? 'border-purple-600' : 'border-slate-800'
            } ${!plan.isActive ? 'opacity-60' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {plan.isPopular && (
              <div className="bg-purple-600 text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5" /> MOST POPULAR
              </div>
            )}

            <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                      <p className="text-[11px] text-slate-500">Sort order: {plan.sortOrder}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => toggleActive(plan._id, plan.isActive)}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                        plan.isActive
                          ? 'bg-green-600/20 text-green-400 hover:bg-red-600/20 hover:text-red-400'
                          : 'bg-red-600/20 text-red-400 hover:bg-green-600/20 hover:text-green-400'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-purple-600/80 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              <p className="text-slate-400 text-xs mb-4">{plan.description}</p>

              <div className="mb-4">
                <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                <span className="text-slate-400 text-sm">/month</span>
                <div className="text-slate-500 text-xs mt-0.5">₹{plan.yearlyPrice}/year • {plan.trialDays} day trial</div>
              </div>

              <div className="space-y-2">
                {featureRows(plan.features).map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{row.label}</span>
                    {typeof row.value === 'boolean' ? (
                      <span className={row.value ? 'text-green-400' : 'text-red-400'}>
                        {row.value ? <Check className="w-4 h-4" /> : '✕'}
                      </span>
                    ) : (
                      <span className="text-white font-medium">{row.value}</span>
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
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !saving && (setEditing(null), setIsNew(false))}
        >
          <div
            className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {isNew ? 'Add Plan' : 'Edit Plan'}
              </h2>
              <button
                type="button"
                onClick={() => !saving && (setEditing(null), setIsNew(false))}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Price/month (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Price/year (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.yearlyPrice}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, yearlyPrice: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Trial days</label>
                    <input
                      type="number"
                      min={0}
                      value={form.trialDays}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, trialDays: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Sort order</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, sortOrder: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPopular}
                      onChange={(e) => setForm((s) => ({ ...s, isPopular: e.target.checked }))}
                      className="rounded border-slate-600 bg-slate-800"
                    />
                    Most popular badge
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                      className="rounded border-slate-600 bg-slate-800"
                    />
                    Active (visible)
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-400 mb-1">Features</p>
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
                      className="flex items-center gap-2 text-slate-300 cursor-pointer"
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
                        className="rounded border-slate-600 bg-slate-800"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Menu items</label>
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
                      className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Staff</label>
                    <input
                      type="number"
                      value={form.features.maxStaff}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          features: { ...s.features, maxStaff: Number(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Tables</label>
                    <input
                      type="number"
                      value={form.features.maxTables}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          features: { ...s.features, maxTables: Number(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs"
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
                {saving ? 'Saving...' : 'Save plan'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
