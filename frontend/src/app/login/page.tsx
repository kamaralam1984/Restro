'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, ChefHat, Star } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      localStorage.setItem('restro-token', data.token);
      localStorage.setItem('restro-user', JSON.stringify(data.user));
      window.location.href = data.redirect || '/';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#080808' }}>
      {/* LEFT BRAND PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(160deg, #0d0a04 0%, #1a1200 50%, #080808 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden md:flex"
      >
        {/* Gold radial glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,151,42,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Decorative gold lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(200,151,42,0.03) 0px, rgba(200,151,42,0.03) 1px, transparent 1px, transparent 60px)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #8b5a00, #c8972a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(200,151,42,0.4)',
          }}>
            <ChefHat size={40} color="#fff8e8" />
          </div>
          <h1 style={{
            fontSize: '48px', fontWeight: 900, margin: '0 0 8px',
            background: 'linear-gradient(135deg, #f8f4ed, #f0c060, #c8972a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Restro OS
          </h1>
          <p style={{ color: '#c8972a', fontSize: '13px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 40px' }}>
            Premium Restaurant Platform
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            {[
              { icon: '🍽️', text: 'Manage your restaurant effortlessly' },
              { icon: '📊', text: 'Real-time orders & analytics' },
              { icon: '👥', text: 'Team management made simple' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12 }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ color: '#a89070', fontSize: '14px' }}>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom stars */}
        <div style={{ position: 'absolute', bottom: '32px', display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#c8972a" color="#c8972a" />)}
          <span style={{ color: '#a89070', fontSize: '13px', marginLeft: '8px' }}>Trusted by 500+ restaurants</span>
        </div>
      </motion.div>

      {/* RIGHT FORM PANEL */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          flex: 1,
          background: '#141414',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Mobile logo */}
          <div className="md:hidden" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 12px',
              background: 'linear-gradient(135deg, #8b5a00, #c8972a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChefHat size={28} color="#fff8e8" />
            </div>
            <h2 style={{ color: '#f8f4ed', fontWeight: 800, fontSize: '24px', margin: 0 }}>Restro OS</h2>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 style={{ color: '#f8f4ed', fontSize: '28px', fontWeight: 800, margin: '0 0 6px' }}>Welcome back</h2>
            <p style={{ color: '#a89070', fontSize: '14px', margin: '0 0 32px' }}>
              Sign in to your account — works for all roles
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
                  borderRadius: '10px', padding: '12px 16px', color: '#fca5a5',
                  fontSize: '14px', marginBottom: '20px',
                }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', color: '#a89070', fontSize: '12px', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  style={{
                    width: '100%', background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)',
                    borderRadius: '12px', padding: '13px 16px', color: '#f8f4ed', fontSize: '15px',
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#c8972a'}
                  onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', color: '#a89070', fontSize: '12px', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="Enter your password"
                    style={{
                      width: '100%', background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)',
                      borderRadius: '12px', padding: '13px 48px 13px 16px', color: '#f8f4ed', fontSize: '15px',
                      outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#c8972a'}
                    onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a89070', display: 'flex' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(240,192,96,0.4)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#6b5040' : 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                  color: '#080808', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  boxShadow: '0 4px 20px rgba(200,151,42,0.3)',
                  marginTop: '4px',
                }}
              >
                <LogIn size={18} />
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            <p style={{ textAlign: 'center', color: '#a89070', fontSize: '14px', marginTop: '24px' }}>
              New here?{' '}
              <Link href="/signup" style={{ color: '#f0c060', fontWeight: 600, textDecoration: 'none' }}>
                Create an account →
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
