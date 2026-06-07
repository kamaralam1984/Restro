'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function MasterAdminLoginPage() {
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
      const res = await fetch(`${API_URL}/auth/master-admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      });
      const data = await res.json();
      if (res.ok && data.token && (data.admin || data.user)) {
        const admin = data.admin || data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify(admin));
        router.push('/admin/master/restaurants');
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
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#080808' }}
    >
      {/* Split layout */}
      <div className="flex w-full max-w-5xl min-h-screen">
        {/* Left brand panel */}
        <div
          className="hidden lg:flex flex-col items-center justify-center flex-1 p-12 relative"
          style={{
            background: '#0d0d0d',
            borderRight: '1px solid rgba(200,151,42,0.15)',
          }}
        >
          {/* Gold radial glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200,151,42,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div className="relative z-10 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                boxShadow: '0 8px 32px rgba(200,151,42,0.35)',
              }}
            >
              <span style={{ fontSize: 36 }}>⚙️</span>
            </div>
            <h2
              className="text-4xl font-bold mb-3"
              style={{
                background: 'linear-gradient(135deg,#f0c060,#c8972a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Restro OS
            </h2>
            <p className="text-lg font-semibold mb-2" style={{ color: '#f8f4ed' }}>
              Master Admin Portal
            </p>
            <p style={{ color: '#a89070', fontSize: 14, maxWidth: 260, margin: '0 auto' }}>
              Full platform management, restaurant oversight, and system configuration.
            </p>
            <div
              className="mt-8 flex flex-col gap-3"
              style={{ color: '#6b5040', fontSize: 13 }}
            >
              <div className="flex items-center gap-2 justify-center">
                <span style={{ color: '#c8972a' }}>✦</span>
                <span>Manage all restaurants</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span style={{ color: '#c8972a' }}>✦</span>
                <span>Platform-wide analytics</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span style={{ color: '#c8972a' }}>✦</span>
                <span>System configuration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div
          className="flex flex-1 items-center justify-center p-8"
          style={{ background: '#080808' }}
        >
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                  boxShadow: '0 8px 24px rgba(200,151,42,0.3)',
                }}
              >
                <span style={{ fontSize: 28 }}>⚙️</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: '#f8f4ed' }}>
                Master Admin
              </h1>
            </div>

            {/* Form card */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: '#141414',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: 18,
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
              }}
            >
              <div className="hidden lg:block text-center mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#f8f4ed' }}>
                  Master Admin Login
                </h1>
                <p style={{ color: '#a89070', fontSize: 14 }}>Platform management panel</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div
                    className="px-4 py-3 rounded text-sm"
                    style={{
                      color: '#ef4444',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 10,
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
                    placeholder="masteradmin@restroos.com"
                    style={{
                      background: '#1c1c1c',
                      border: '1px solid rgba(200,151,42,0.2)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      color: '#f8f4ed',
                      outline: 'none',
                      fontSize: 14,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
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
                      fontSize: 14,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#c8972a')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)')}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold py-3"
                  style={{
                    background: loading
                      ? 'rgba(200,151,42,0.4)'
                      : 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
                    color: '#080808',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full inline-block"
                        style={{
                          border: '3px solid rgba(8,8,8,0.3)',
                          borderTopColor: '#080808',
                          animation: 'spin 0.7s linear infinite',
                        }}
                      />
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-sm" style={{ color: '#6b5040' }}>
                <Link
                  href="/admin/super/login"
                  style={{ color: '#a89070' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#c8972a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#a89070')}
                >
                  Super Admin login
                </Link>
                <span style={{ margin: '0 8px', color: '#6b5040' }}>·</span>
                <Link
                  href="/admin/login"
                  style={{ color: '#a89070' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#c8972a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#a89070')}
                >
                  Rental Admin login
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
