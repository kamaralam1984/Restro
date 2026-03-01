'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChefHat } from 'lucide-react';
import api from '@/services/api';
import { useUser } from '@/context/UserContext';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);

    const loginData = {
      email: credentials.email.trim(),
      password: credentials.password,
      restaurantId: process.env.NEXT_PUBLIC_RESTAURANT_ID,
    };

    try {
      // First try customer login
      const response = await api.post('/auth/login', loginData);
      if (response.token && response.user) {
        login(response.token, response.user);
        toast.success('Login successful!');
        router.push('/');
        return;
      }
    } catch {
      // Customer login failed — try admin/super_admin login
    }

    try {
      const adminResponse = await api.post('/auth/admin/login', loginData);
      if (adminResponse.token && adminResponse.admin) {
        localStorage.setItem('token', adminResponse.token);
        localStorage.setItem('admin', JSON.stringify(adminResponse.admin));
        const role = adminResponse.admin?.role;
        toast.success('Login successful! Redirecting...');
        router.push('/admin/dashboard');
        return;
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Invalid email or password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <motion.div
        className="bg-slate-900 rounded-xl p-8 w-full max-w-md shadow-2xl border border-slate-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-orange-600 hover:text-orange-500 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-600">
            Admin credentials also work here — you&apos;ll be redirected to the admin panel.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

