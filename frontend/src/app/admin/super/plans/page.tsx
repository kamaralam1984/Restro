'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Check, Star } from 'lucide-react';
import api from '@/services/api';

interface Plan {
  _id: string; name: string; description: string;
  price: number; yearlyPrice: number; trialDays: number;
  isActive: boolean; isPopular: boolean; sortOrder: number;
  features: {
    maxMenuItems: number; maxStaff: number; maxTables: number;
    onlineOrdering: boolean; analytics: boolean; customDomain: boolean;
    whatsappIntegration: boolean; razorpayIntegration: boolean; emailSupport: boolean;
  };
}

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPlans(); }, []);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const loadPlans = async () => {
    try {
      const data = await api.get('/super-admin/plans', { headers: headers() });
      setPlans(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await api.put(`/super-admin/plans/${id}`, { isActive: !current }, { headers: headers() });
      setPlans((prev) => prev.map((p) => p._id === id ? { ...p, isActive: !current } : p));
    } catch {}
  };

  const fmt = (n: number) => n === -1 ? 'Unlimited' : n.toString();
  const featureRows = (f: Plan['features']) => [
    { label: 'Menu Items', value: fmt(f.maxMenuItems) },
    { label: 'Staff Members', value: fmt(f.maxStaff) },
    { label: 'Tables', value: fmt(f.maxTables) },
    { label: 'Online Ordering', value: f.onlineOrdering },
    { label: 'Analytics', value: f.analytics },
    { label: 'Custom Domain', value: f.customDomain },
    { label: 'WhatsApp Integration', value: f.whatsappIntegration },
    { label: 'Razorpay Payments', value: f.razorpayIntegration },
    { label: 'Email Support', value: f.emailSupport },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-level pricing plans</p>
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
                  <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                </div>
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
    </div>
  );
}
