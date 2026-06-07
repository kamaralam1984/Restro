'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      // Trim email and password
      const loginData = {
        email: credentials.email.trim(),
        password: credentials.password,
      };

      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token && data.admin) {
          // Rental panel only: reject platform roles so they use their own links
          if (data.admin.role === 'super_admin' || data.admin.role === 'master_admin') {
            setError('Use Super Admin or Master Admin login for platform panel.');
            setLoading(false);
            return;
          }
          localStorage.setItem('token', data.token);
          localStorage.setItem('admin', JSON.stringify(data.admin));
          // Restaurant admin → full admin panel; staff/manager/cashier → staff panel
          if (data.admin.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/staff');
          }
        } else {
          setError('Invalid response from server');
        }
      } else {
        setError(data.error || 'Invalid credentials');
        console.error('Login error:', data);
      }
    } catch (err: any) {
      setError('Login failed. Please check your connection and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#080808' }}
    >
      {/* Split-panel layout */}
      <div className="flex w-full max-w-4xl min-h-screen overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Left brand panel */}
        <div
          className="hidden lg:flex flex-col items-center justify-center flex-1 relative"
          style={{
            background: '#0d0d0d',
            backgroundImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(200,151,42,0.13) 0%, transparent 70%)',
          }}
        >
          {/* Gold glow accent */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200,151,42,0.10) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div className="relative z-10 text-center px-10">
            <div
              className="w-20 h-20 flex items-center justify-center rounded-2xl mx-auto mb-6"
              style={{
                background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                boxShadow: '0 0 40px rgba(200,151,42,0.35)',
              }}
            >
              <span style={{ fontSize: 40 }}>👨‍🍳</span>
            </div>
            <h2
              style={{
                color: '#f0c060',
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: '0.04em',
                marginBottom: 12,
              }}
            >
              RestroOS
            </h2>
            <p style={{ color: '#a89070', fontSize: 15, lineHeight: 1.6 }}>
              Premium Restaurant Management<br />Platform
            </p>
            <div
              style={{
                marginTop: 40,
                borderTop: '1px solid rgba(200,151,42,0.15)',
                paddingTop: 32,
              }}
            >
              <p style={{ color: '#6b5040', fontSize: 13 }}>
                Secure admin access only
              </p>
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
                className="w-14 h-14 flex items-center justify-center rounded-xl mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                  boxShadow: '0 0 30px rgba(200,151,42,0.3)',
                }}
              >
                <span style={{ fontSize: 28 }}>👨‍🍳</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1
                style={{
                  color: '#f8f4ed',
                  fontWeight: 800,
                  fontSize: 30,
                  marginBottom: 8,
                }}
              >
                Admin Login
              </h1>
              <p style={{ color: '#a89070', fontSize: 14 }}>Restaurant Admin Panel</p>
            </div>

            <div
              style={{
                background: '#141414',
                border: '1px solid rgba(200,151,42,0.2)',
                borderRadius: 18,
                padding: 36,
                boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
              }}
            >
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#ef4444',
                      padding: '12px 16px',
                      borderRadius: 10,
                      fontSize: 14,
                    }}
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#a89070',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                    placeholder="admin@demorestaurant.com"
                    style={{
                      width: '100%',
                      background: '#1c1c1c',
                      border: '1px solid rgba(200,151,42,0.2)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      color: '#f8f4ed',
                      outline: 'none',
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#c8972a'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)'; }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#a89070',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      background: '#1c1c1c',
                      border: '1px solid rgba(200,151,42,0.2)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      color: '#f8f4ed',
                      outline: 'none',
                      fontSize: 14,
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#c8972a'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,151,42,0.2)'; }}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full transition-colors disabled:cursor-not-allowed"
                  style={{
                    background: loading
                      ? 'rgba(200,151,42,0.4)'
                      : 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                    color: '#080808',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 15,
                    padding: '12px 0',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.04em',
                  }}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </motion.button>
              </form>

              <p className="mt-6 text-center" style={{ fontSize: 13 }}>
                <Link
                  href="/admin/super/login"
                  style={{ color: '#a89070' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#f0c060'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#a89070'; }}
                >
                  Super Admin
                </Link>
                <span style={{ color: '#6b5040', margin: '0 8px' }}>·</span>
                <Link
                  href="/admin/master/login"
                  style={{ color: '#a89070' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#f0c060'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#a89070'; }}
                >
                  Master Admin
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
