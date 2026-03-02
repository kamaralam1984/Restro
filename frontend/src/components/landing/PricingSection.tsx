'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Pencil, X, Package, Star } from 'lucide-react';
import api from '@/services/api';

export interface PlanFromApi {
  _id: string;
  name: string;
  description?: string;
  price: number;
  yearlyPrice?: number;
  trialDays?: number;
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  features?: {
    maxMenuItems?: number;
    maxStaff?: number;
    maxTables?: number;
    onlineOrdering?: boolean;
    tableBooking?: boolean;
    billing?: boolean;
    analytics?: boolean;
    staffControl?: boolean;
    customDomain?: boolean;
    whatsappIntegration?: boolean;
    razorpayIntegration?: boolean;
    emailSupport?: boolean;
  };
}

const defaultPlans: Array<{ name: string; price: string; period: string; features: string[]; popular: boolean }> = [
  { name: 'Basic', price: '₹1,999', period: '/month', features: ['Orders', 'Menu management'], popular: false },
  { name: 'Pro', price: '₹3,999', period: '/month', features: ['Orders', 'Billing', 'Table Booking'], popular: true },
  { name: 'Premium', price: '₹6,999', period: '/month', features: ['Full system', 'Analytics', 'Priority Support'], popular: false },
];

function fmtLimit(n: number | undefined): string {
  if (n === undefined) return '—';
  return n === -1 ? 'Unlimited' : String(n);
}

function featureRows(f: PlanFromApi['features']) {
  const fe = f ?? {};
  return [
    { label: 'Menu Items', value: fmtLimit(fe.maxMenuItems) },
    { label: 'Staff Members', value: fmtLimit(fe.maxStaff) },
    { label: 'Tables', value: fmtLimit(fe.maxTables) },
    { label: 'Online Ordering', value: fe.onlineOrdering ?? false },
    { label: 'Analytics', value: fe.analytics ?? false },
    { label: 'Custom Domain', value: fe.customDomain ?? false },
    { label: 'WhatsApp Integration', value: fe.whatsappIntegration ?? false },
    { label: 'Razorpay Payments', value: fe.razorpayIntegration ?? false },
    { label: 'Email Support', value: fe.emailSupport ?? true },
  ];
}

const defaultFeatures = {
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

function EditPlanModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: PlanFromApi;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: plan.name,
    description: plan.description ?? '',
    price: plan.price,
    yearlyPrice: plan.yearlyPrice ?? plan.price * 10,
    trialDays: plan.trialDays ?? 14,
    isPopular: plan.isPopular ?? false,
    isActive: plan.isActive ?? true,
    features: { ...defaultFeatures, ...plan.features },
  });

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(
        `/super-admin/plans/${plan._id}`,
        {
          name: form.name,
          description: form.description || undefined,
          price: form.price,
          yearlyPrice: form.yearlyPrice,
          trialDays: form.trialDays,
          isPopular: form.isPopular,
          isActive: form.isActive,
          features: form.features,
        },
        { headers: headers() }
      );
      onSaved();
      onClose();
    } catch {
      setSaving(false);
    }
  };

  const f = form.features;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">Edit plan</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Plan name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Price/month (₹)</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Price/year (₹)</label>
              <input
                type="number"
                min={0}
                value={form.yearlyPrice}
                onChange={(e) => setForm((s) => ({ ...s, yearlyPrice: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Trial days</label>
            <input
              type="number"
              min={0}
              value={form.trialDays}
              onChange={(e) => setForm((s) => ({ ...s, trialDays: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(e) => setForm((s) => ({ ...s, isPopular: e.target.checked }))}
                className="rounded border-slate-600"
              />
              Most popular
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                className="rounded border-slate-600"
              />
              Active (visible on site)
            </label>
          </div>
          <div className="border-t border-slate-700 pt-3">
            <p className="text-sm text-slate-400 mb-2">Features</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
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
                <label key={key} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f[key] ?? false}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        features: { ...s.features, [key]: e.target.checked },
                      }))
                    }
                    className="rounded border-slate-600"
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <label className="block text-xs text-slate-500">Menu items</label>
                <input
                  type="number"
                  min={-1}
                  value={f.maxMenuItems === -1 ? '' : f.maxMenuItems}
                  placeholder="Unlimited"
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      features: { ...s.features, maxMenuItems: e.target.value === '' ? -1 : Number(e.target.value) },
                    }))
                  }
                  className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Staff</label>
                <input
                  type="number"
                  min={-1}
                  value={f.maxStaff === -1 ? '' : f.maxStaff}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      features: { ...s.features, maxStaff: e.target.value === '' ? -1 : Number(e.target.value) },
                    }))
                  }
                  className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Tables</label>
                <input
                  type="number"
                  min={-1}
                  value={f.maxTables === -1 ? '' : f.maxTables}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      features: { ...s.features, maxTables: e.target.value === '' ? -1 : Number(e.target.value) },
                    }))
                  }
                  className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PricingSection() {
  const [plansFromApi, setPlansFromApi] = useState<PlanFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanFromApi | null>(null);

  useEffect(() => {
    api
      .get<PlanFromApi[]>('/restaurants/plans')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlansFromApi(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const admin = localStorage.getItem('admin');
      if (admin) {
        const parsed = JSON.parse(admin);
        setIsMasterAdmin(parsed?.role === 'master_admin' || parsed?.role === 'super_admin');
      }
    } catch {}
  }, []);

  const showApiCards = plansFromApi.length > 0;
  const sortedPlans = [...plansFromApi].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const refetch = () => {
    api.get<PlanFromApi[]>('/restaurants/plans').then((data) => {
      setPlansFromApi(Array.isArray(data) ? data : []);
    }).catch(() => setPlansFromApi([]));
  };

  return (
    <section id="pricing" className="py-24 bg-slate-900/50 border-y border-slate-800 scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Simple, Transparent Pricing
        </motion.h2>
        <motion.p
          className="text-slate-400 text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Choose the plan that fits your restaurant.
          {isMasterAdmin && (
            <span className="block mt-2 text-amber-400/90 text-sm">
              You can edit plans here — changes apply everywhere (this page &amp; admin panel).
            </span>
          )}
        </motion.p>
        {loading && !showApiCards ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
          </div>
        ) : showApiCards ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {sortedPlans.map((plan, i) => (
              <motion.div
                key={plan._id}
                className={`relative bg-slate-900 rounded-2xl overflow-hidden border-2 transition-all ${
                  plan.isPopular ? 'border-amber-600' : 'border-slate-800'
                } ${plan.isActive === false ? 'opacity-60' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {plan.isPopular && (
                  <div className="bg-amber-600 text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5" /> MOST POPULAR
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-amber-400" />
                      </div>
                      <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                    </div>
                    {isMasterAdmin ? (
                      <button
                        type="button"
                        onClick={() => setEditingPlan(plan)}
                        className="p-2 rounded-lg bg-slate-700/80 text-slate-300 hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
                        title="Edit plan"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-600/20 text-green-400">
                        Active
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-slate-400 text-xs mb-4">{plan.description}</p>
                  )}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                    <span className="text-slate-400 text-sm">/month</span>
                    <div className="text-slate-500 text-xs mt-0.5">
                      ₹{plan.yearlyPrice ?? plan.price * 10}/year • {plan.trialDays ?? 14} day trial
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
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
                  <Link href="/restaurant/signup">
                    <motion.button
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {defaultPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl border backdrop-blur p-6 flex flex-col ${
                  plan.popular
                    ? 'border-orange-500/50 bg-slate-900/80 shadow-lg shadow-orange-500/10'
                    : 'border-slate-700/50 bg-slate-900/40'
                }`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-500 text-white text-sm font-medium">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/restaurant/signup">
                  <motion.button
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={refetch}
        />
      )}
    </section>
  );
}
