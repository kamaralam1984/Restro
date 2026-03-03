'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChefHat, Rocket } from 'lucide-react';
import api from '@/services/api';
import { loadRazorpayScript } from '@/utils/razorpay';
import toast, { Toaster } from 'react-hot-toast';

interface Plan {
  _id: string;
  name: string;
  price: number;
  description?: string;
  trialDays?: number;
}

export default function RestaurantSignupPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [signupMode, setSignupMode] = useState<'trial' | 'paid'>('trial');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    planId: '',
    email: '',
    adminPassword: '',
    adminName: '',
    adminPhone: '',
  });

  useEffect(() => {
    api.get<Plan[]>('/restaurants/plans').then(setPlans).catch(() => setPlans([]));
  }, []);

  const handleSlugFromName = () => {
    if (!formData.name.trim()) return;
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, slug: slug || prev.slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.slug?.trim()) {
      toast.error('Restaurant name and slug are required');
      return;
    }
    if (!formData.planId?.trim()) {
      toast.error('Please select a plan');
      return;
    }
    if (!formData.email?.trim()) {
      toast.error('Admin email is required');
      return;
    }
    if (!formData.adminPassword || formData.adminPassword.length < 8) {
      toast.error('Password is required (min 8 characters)');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      toast.error('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }


    setLoading(true);
    try {
      const payload: Record<string, string> = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        planId: formData.planId.trim(),
        email: formData.email.trim(),
        adminPassword: formData.adminPassword,
      };
      if (formData.adminName?.trim()) payload.adminName = formData.adminName.trim();
      if (formData.adminPhone?.trim()) payload.adminPhone = formData.adminPhone.trim();

      if (signupMode === 'trial') {
        const res = await api.post<{
          message: string;
          adminUser: { loginUrl: string };
          restaurant: { name: string; slug: string };
        }>('/restaurants/signup', payload);

        toast.success(res.message || 'Restaurant created with free trial! You can now log in.');
        router.push('/admin/login');
        return;
      }

      // Paid subscription: create Razorpay order, open checkout, then verify and finish signup
      const orderData = await api.post<{
        key: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        pendingId: string;
      }>('/restaurants/signup/payment-order', payload);

      await loadRazorpayScript();

      const options: any = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Restro OS Subscription',
        description: 'Restaurant subscription signup',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.adminName || formData.name,
          email: formData.email,
          contact: formData.adminPhone || '',
        },
        theme: {
          color: '#ea580c',
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await api.post<{
              message: string;
              adminUser: { loginUrl: string };
              restaurant: { name: string; slug: string };
            }>('/restaurants/signup/verify-payment', {
              pendingId: orderData.pendingId,
              razorpayOrderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            toast.success(verifyRes.message || 'Restaurant created with paid subscription! You can now log in.');
            router.push('/admin/login');
          } catch (err: any) {
            toast.error(err?.message || 'Payment verified but signup failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled. Restaurant was not created.');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.error || 'Signup failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-12">
      <Toaster position="top-right" />
      <motion.div
        className="bg-slate-900 rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-slate-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {signupMode === 'trial' ? 'Start Your Free Trial' : 'Start With Paid Subscription'}
          </h1>
          <p className="text-slate-400 text-sm">Create your restaurant and admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Restaurant name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onBlur={handleSlugFromName}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="My Restaurant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">URL slug (e.g. my-restaurant)</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
              placeholder="my-restaurant"
            />
            <p className="text-xs text-slate-500 mt-1">Your store will be at /r/{formData.slug || '...'}</p>
          </div>

          {plans.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Plan</label>
              <select
                required
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a plan</option>
                {plans.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — ₹{p.price}/mo {p.trialDays ? `(${p.trialDays} days trial)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Signup mode: trial vs paid subscription */}
          <div>
            <span className="block text-sm font-medium text-slate-300 mb-2">How do you want to start?</span>
            <div className="flex flex-col gap-2 bg-slate-900 border border-slate-800 rounded-lg p-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="signupMode"
                  value="trial"
                  checked={signupMode === 'trial'}
                  onChange={() => setSignupMode('trial')}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm text-slate-100 font-medium">Free trial (recommended)</p>
                  <p className="text-xs text-slate-400">
                    Start with a {plans.find((p) => p._id === formData.planId)?.trialDays ?? 10}-day trial. You can
                    upgrade to a paid subscription any time from Super Admin.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-2 cursor-pointer opacity-90">
                <input
                  type="radio"
                  name="signupMode"
                  value="paid"
                  checked={signupMode === 'paid'}
                  onChange={() => setSignupMode('paid')}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm text-slate-100 font-medium">Paid subscription (online payment)</p>
                  <p className="text-xs text-slate-400">
                    Create your account now and complete the subscription payment online. (Current version still
                    creates a trial; payment integration will be enabled next.)
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Admin email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="admin@restaurant.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.adminPassword}
              onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Admin name (optional)</label>
            <input
              type="text"
              value={formData.adminName}
              onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Owner / Manager name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Admin phone (optional)</label>
            <input
              type="tel"
              value={formData.adminPhone}
              onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="+91 9876543210"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            whileHover={loading ? {} : { scale: 1.02 }}
            whileTap={loading ? {} : { scale: 0.98 }}
          >
            <Rocket className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create restaurant & go to login'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link href="/admin/login" className="text-orange-600 hover:text-orange-500 font-semibold">
              Admin Login
            </Link>
          </p>
          <p className="text-slate-500 text-xs mt-2">
            <Link href="/" className="hover:text-slate-400">Back to home</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
