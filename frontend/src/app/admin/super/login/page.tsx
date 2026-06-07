'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/super-admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify(data.user));
        router.push('/admin/super/restaurants');
        return;
      }
      if (res.ok && data.token && data.admin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        router.push('/admin/super/restaurants');
        return;
      }
      setError(data.error || 'Invalid credentials');
    } catch {
      setError('Login failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#080808' }}
    >
      <motion.div
        className="rounded-xl p-8 w-full max-w-md shadow-2xl"
        style={{
          background: '#141414',
          border: '1px solid rgba(200,151,42,0.2)',
          borderRadius: 18,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
              }}
            >
              <span className="text-2xl">🛡️</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#f8f4ed' }}>
            Super Admin Login
          </h1>
          <p style={{ color: '#a89070' }}>Platform control panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div
              className="px-4 py-3 rounded text-sm"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
              }}
            >
              {error}
            </div>
          )}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#a89070' }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full"
              placeholder="superadmin@restroos.com"
              style={{
                background: '#1c1c1c',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#f8f4ed',
                outline: 'none',
                width: '100%',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid rgba(200,151,42,0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(200,151,42,0.2)';
              }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#a89070' }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full"
              placeholder="Enter your password"
              style={{
                background: '#1c1c1c',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#f8f4ed',
                outline: 'none',
                width: '100%',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid rgba(200,151,42,0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(200,151,42,0.2)';
              }}
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full font-semibold py-3 rounded-lg transition-colors"
            style={{
              background: loading
                ? 'rgba(200,151,42,0.4)'
                : 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
              color: '#080808',
              border: 'none',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: '#6b5040' }}>
          <Link
            href="/admin/login"
            style={{ color: '#a89070' }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#f8f4ed'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#a89070'; }}
          >
            Rental Admin login
          </Link>
          {' · '}
          <Link
            href="/admin/master/login"
            style={{ color: '#a89070' }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#f8f4ed'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#a89070'; }}
          >
            Master Admin login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
