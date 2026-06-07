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

export default function MasterAdminPlansPage() {
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
      <div
        className="animate-spin rounded-full h-10 w-10"
        style={{ border: '3px solid rgba(200,151,42,0.2)', borderTopColor: '#c8972a' }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>Subscription Plans</h1>
        <p className="text-sm mt-1" style={{ color: '#a89070' }}>Platform-level pricing plans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.sort((a, b) => a.sortOrder - b.sortOrder).map((plan, i) => (
          <motion.div
            key={plan._id}
            className="rounded-2xl overflow-hidden transition-all"
            style={{
              background: '#141414',
              border: plan.isPopular ? '2px solid #c8972a' : '2px solid rgba(200,151,42,0.15)',
              opacity: plan.isActive ? 1 : 0.6,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: plan.isActive ? 1 : 0.6, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {plan.isPopular && (
              <div
                className="text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1"
                style={{ background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)', color: '#080808' }}
              >
                <Star className="w-3.5 h-3.5" /> MOST POPULAR
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(200,151,42,0.15)' }}
                  >
                    <Package className="w-4 h-4" style={{ color: '#f0c060' }} />
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: '#f8f4ed' }}>{plan.name}</h3>
                </div>
                <button
                  onClick={() => toggleActive(plan._id, plan.isActive)}
                  className="text-xs px-2.5 py-1 rounded-full font-semibold transition-colors"
                  style={
                    plan.isActive
                      ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }
                      : { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
                  }
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <p className="text-xs mb-4" style={{ color: '#a89070' }}>{plan.description}</p>

              <div className="mb-4">
                <span className="text-3xl font-bold" style={{ color: '#f8f4ed' }}>₹{plan.price}</span>
                <span className="text-sm" style={{ color: '#a89070' }}>/month</span>
                <div className="text-xs mt-0.5" style={{ color: '#6b5040' }}>₹{plan.yearlyPrice}/year • {plan.trialDays} day trial</div>
              </div>

              <div className="space-y-2">
                {featureRows(plan.features).map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span style={{ color: '#a89070' }}>{row.label}</span>
                    {typeof row.value === 'boolean' ? (
                      <span style={row.value ? { color: '#22c55e' } : { color: '#ef4444' }}>
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
    </div>
  );
}
