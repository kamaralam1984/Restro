'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Send, CheckCircle, ChefHat, RotateCcw } from 'lucide-react';

type Step = 'form' | 'otp';

export default function SignupPage() {
  const [step, setStep] = useState<Step>('form');

  // Step 1 fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 fields
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: '12px', padding: '13px 16px', color: '#f8f4ed', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#a89070', fontSize: '12px', fontWeight: 600,
    marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase',
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(v => {
        if (v <= 1) { clearInterval(interval); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/send-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); return; }
      setStep('otp');
      startCooldown();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/send-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to resend OTP'); return; }
      startCooldown();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Please enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/verify-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Verification failed'); return; }
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
          flex: '0 0 42%',
          background: 'linear-gradient(160deg, #0d0a04 0%, #1a1200 50%, #080808 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '60px 48px', position: 'relative', overflow: 'hidden',
        }}
        className="hidden md:flex"
      >
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,151,42,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(200,151,42,0.03) 0px, rgba(200,151,42,0.03) 1px, transparent 1px, transparent 60px)',
          pointerEvents: 'none',
        }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
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
            fontSize: '44px', fontWeight: 900, margin: '0 0 8px',
            background: 'linear-gradient(135deg, #f8f4ed, #f0c060, #c8972a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Join Restro OS
          </h1>
          <p style={{ color: '#c8972a', fontSize: '13px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 40px' }}>
            Start your journey today
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: '🆓', title: 'Free to start', desc: 'No credit card required' },
              { icon: '⚡', title: 'Setup in 2 minutes', desc: 'Ready to take orders instantly' },
              { icon: '🔒', title: 'Secure & verified', desc: 'Email verification required' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', textAlign: 'left' }}
              >
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ color: '#f8f4ed', fontSize: '14px', fontWeight: 600, margin: '0 0 2px' }}>{item.title}</p>
                  <p style={{ color: '#a89070', fontSize: '12px', margin: 0 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* RIGHT FORM PANEL */}
      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          flex: 1, background: '#141414',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px', overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px', paddingBlock: '20px' }}>
          {/* Mobile logo */}
          <div className="md:hidden" style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 10px',
              background: 'linear-gradient(135deg, #8b5a00, #c8972a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChefHat size={26} color="#fff8e8" />
            </div>
            <h2 style={{ color: '#f8f4ed', fontWeight: 800, fontSize: '22px', margin: 0 }}>Restro OS</h2>
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: SIGNUP FORM ── */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}
              >
                <h2 style={{ color: '#f8f4ed', fontSize: '26px', fontWeight: 800, margin: '0 0 6px' }}>Create account</h2>
                <p style={{ color: '#a89070', fontSize: '14px', margin: '0 0 28px' }}>
                  We&apos;ll send a verification code to your email
                </p>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
                      borderRadius: '10px', padding: '12px 16px', color: '#fca5a5',
                      fontSize: '14px', marginBottom: '16px',
                    }}>{error}</motion.div>
                )}

                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                      placeholder="Your full name" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#c8972a'}
                      onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="you@example.com" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#c8972a'}
                      onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)} required
                        placeholder="Min. 6 characters"
                        style={{ ...inputStyle, paddingRight: '48px' }}
                        onFocus={e => e.target.style.borderColor = '#c8972a'}
                        onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'} />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a89070', display: 'flex' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                      placeholder="Repeat your password" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#c8972a'}
                      onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'} />
                  </div>

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
                      boxShadow: '0 4px 20px rgba(200,151,42,0.3)', marginTop: '4px',
                    }}
                  >
                    <Send size={18} />
                    {loading ? 'Sending code...' : 'Send Verification Code'}
                  </motion.button>
                </form>

                <p style={{ textAlign: 'center', color: '#a89070', fontSize: '14px', marginTop: '20px' }}>
                  Already have an account?{' '}
                  <Link href="/login" style={{ color: '#f0c060', fontWeight: 600, textDecoration: 'none' }}>
                    Sign in →
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: OTP VERIFICATION ── */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}
              >
                {/* Email sent confirmation */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(200,151,42,0.08)', border: '1px solid rgba(200,151,42,0.2)',
                  borderRadius: '12px', padding: '14px 16px', marginBottom: '28px',
                }}>
                  <CheckCircle size={20} color="#c8972a" style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#f8f4ed', fontSize: '13px', fontWeight: 600, margin: '0 0 2px' }}>
                      Verification code sent!
                    </p>
                    <p style={{ color: '#a89070', fontSize: '12px', margin: 0 }}>
                      Check your inbox at <span style={{ color: '#f0c060' }}>{email}</span>
                    </p>
                  </div>
                </div>

                <h2 style={{ color: '#f8f4ed', fontSize: '26px', fontWeight: 800, margin: '0 0 6px' }}>
                  Enter verification code
                </h2>
                <p style={{ color: '#a89070', fontSize: '14px', margin: '0 0 28px' }}>
                  Enter the 6-digit code we sent to your email
                </p>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
                      borderRadius: '10px', padding: '12px 16px', color: '#fca5a5',
                      fontSize: '14px', marginBottom: '16px',
                    }}>{error}</motion.div>
                )}

                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>6-Digit Code</label>
                    <input
                      type="text" value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required maxLength={6} placeholder="••••••"
                      style={{
                        ...inputStyle,
                        fontSize: '28px', fontWeight: 800, letterSpacing: '0.3em',
                        textAlign: 'center', padding: '16px',
                      }}
                      onFocus={e => e.target.style.borderColor = '#c8972a'}
                      onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'}
                    />
                  </div>

                  <motion.button
                    type="submit" disabled={loading || otp.length !== 6}
                    whileHover={{ scale: otp.length === 6 ? 1.02 : 1, boxShadow: otp.length === 6 ? '0 8px 32px rgba(240,192,96,0.4)' : 'none' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%', padding: '14px',
                      background: (loading || otp.length !== 6) ? '#6b5040' : 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                      color: '#080808', border: 'none', borderRadius: '12px',
                      fontSize: '15px', fontWeight: 800,
                      cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                      boxShadow: '0 4px 20px rgba(200,151,42,0.3)',
                    }}
                  >
                    <CheckCircle size={18} />
                    {loading ? 'Verifying...' : 'Create Account'}
                  </motion.button>
                </form>

                {/* Resend + Back */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button
                    type="button" onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    style={{
                      background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      color: resendCooldown > 0 ? '#6b5040' : '#f0c060',
                      fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px',
                      padding: 0,
                    }}
                  >
                    <RotateCcw size={13} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>

                  <button
                    type="button" onClick={() => { setStep('form'); setOtp(''); setError(''); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#a89070', fontSize: '13px', padding: 0,
                    }}
                  >
                    ← Change email
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
