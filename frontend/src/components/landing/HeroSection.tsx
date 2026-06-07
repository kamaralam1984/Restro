'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flame, Star, ChefHat, Zap } from 'lucide-react';

const PHRASES = ['Orders', 'Billing', 'Bookings', 'Analytics', 'Staff'];

function useTyping(phrases: string[], speed = 80, pause = 2000) {
  const [text, setText] = useState('');
  const [pi, setPi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = phrases[pi];
    const t = setTimeout(() => {
      if (!del) {
        setText(cur.slice(0, ci + 1));
        if (ci + 1 === cur.length) setTimeout(() => setDel(true), pause);
        else setCi(c => c + 1);
      } else {
        setText(cur.slice(0, ci - 1));
        if (ci - 1 === 0) { setDel(false); setPi(i => (i + 1) % phrases.length); setCi(0); }
        else setCi(c => c - 1);
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [ci, del, pi, phrases, speed, pause]);
  return text;
}

// KOT Card (Kitchen Order Ticket) — the restaurant-feel visual
function KOTCard() {
  const items = [
    { emoji: '🍗', name: 'Butter Chicken', qty: '×2', price: '₹480' },
    { emoji: '🫓', name: 'Garlic Naan', qty: '×4', price: '₹160' },
    { emoji: '🍚', name: 'Jeera Rice', qty: '×2', price: '₹180' },
    { emoji: '🥛', name: 'Sweet Lassi', qty: '×3', price: '₹180' },
  ];
  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 32, rotate: 1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.75, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow behind */}
      <div className="absolute inset-0 rounded-3xl blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(255,80,0,0.3), transparent 70%)', transform: 'scale(1.1)' }} />

      {/* Receipt card */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border"
        style={{
          background: 'linear-gradient(160deg, #1e1106 0%, #140c02 100%)',
          borderColor: 'rgba(255,140,30,0.2)',
          boxShadow: '0 32px 80px rgba(255,60,0,0.2), 0 0 0 1px rgba(255,140,30,0.1)',
        }}>

        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(255,140,30,0.15)', background: 'rgba(255,80,0,0.08)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ff4500, #ff8f00)' }}>
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: '#fef3e2' }}>KOT #0142</p>
              <p className="text-[10px]" style={{ color: '#c9956a' }}>Table 7 · Dine In</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50' }}>
            ● Live
          </span>
        </div>

        {/* Order items */}
        <div className="px-5 py-4 space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.name} className="flex items-center gap-3"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}>
              <span className="text-xl">{item.emoji}</span>
              <span className="text-sm flex-1 font-medium" style={{ color: '#fef3e2' }}>{item.name}</span>
              <span className="text-xs" style={{ color: '#c9956a' }}>{item.qty}</span>
              <span className="text-sm font-bold" style={{ color: '#ffa726' }}>{item.price}</span>
            </motion.div>
          ))}
        </div>

        {/* Dashed divider */}
        <div className="mx-5 border-b border-dashed" style={{ borderColor: 'rgba(255,140,30,0.2)' }} />

        {/* Total */}
        <div className="px-5 py-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm" style={{ color: '#c9956a' }}>Subtotal</span>
            <span className="font-semibold" style={{ color: '#fef3e2' }}>₹1,000</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm" style={{ color: '#c9956a' }}>GST 5%</span>
            <span className="font-semibold" style={{ color: '#fef3e2' }}>₹50</span>
          </div>
          <div className="flex justify-between items-center rounded-xl px-4 py-3"
            style={{ background: 'linear-gradient(135deg, rgba(255,69,0,0.2), rgba(255,143,0,0.15))' }}>
            <span className="font-bold" style={{ color: '#fef3e2' }}>Total</span>
            <span className="text-xl font-black" style={{ color: '#ffa726' }}>₹1,050</span>
          </div>
        </div>

        {/* Status bar */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-1.5 mb-1.5">
            {['Ordered', 'Preparing', 'Ready', 'Served'].map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,140,30,0.15)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: i <= 1 ? 'linear-gradient(90deg, #ff4500, #ff8f00)' : 'transparent' }}
                    initial={{ width: 0 }}
                    animate={{ width: i <= 1 ? '100%' : '0%' }}
                    transition={{ delay: 1 + i * 0.15, duration: 0.5 }} />
                </div>
                <span className="text-[8px]" style={{ color: i <= 1 ? '#ffa726' : '#7d5030' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <motion.div
        className="absolute -right-6 top-8 rounded-2xl border px-4 py-3 shadow-xl"
        style={{
          background: '#1e1106',
          borderColor: 'rgba(255,140,30,0.2)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
        }}
        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}>
        <p className="text-[10px] mb-0.5" style={{ color: '#c9956a' }}>Today's Revenue</p>
        <p className="text-base font-black" style={{ color: '#ffa726' }}>₹48,200</p>
        <p className="text-[10px] font-semibold" style={{ color: '#4caf50' }}>↑ 34% vs yesterday</p>
      </motion.div>

      <motion.div
        className="absolute -left-6 bottom-16 rounded-2xl border px-4 py-3 shadow-xl"
        style={{
          background: '#1e1106',
          borderColor: 'rgba(255,140,30,0.2)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
        }}
        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}>
        <p className="text-[10px] mb-0.5" style={{ color: '#c9956a' }}>Active Tables</p>
        <p className="text-base font-black" style={{ color: '#fef3e2' }}>13 / 16</p>
        <p className="text-[10px]" style={{ color: '#c9956a' }}>3 available</p>
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection() {
  const typed = useTyping(PHRASES);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>

      {/* Dark overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(13,7,0,0.75)' }} />

      {/* Fire glow background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main fire glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 800, height: 500,
            background: 'radial-gradient(ellipse at 50% 100%, rgba(255,80,0,0.18) 0%, rgba(255,140,0,0.08) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
        {/* Left ambient */}
        <div className="absolute -top-20 -left-20 rounded-full"
          style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(255,60,0,0.07), transparent 70%)', filter: 'blur(60px)' }} />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,160,60,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Smoke particles */}
        {[10, 30, 55, 72, 88].map((left, i) => (
          <div key={i}
            className="absolute bottom-0 w-2 h-2 rounded-full animate-rise"
            style={{
              left: `${left}%`,
              background: 'rgba(255,120,30,0.15)',
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${3 + i * 0.5}s`,
              filter: 'blur(4px)',
            }} />
        ))}
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="grid lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-center">

          {/* LEFT */}
          <div className="space-y-8 max-w-xl">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border"
                style={{
                  background: 'rgba(255,69,0,0.12)',
                  borderColor: 'rgba(255,100,0,0.3)',
                  color: '#ffa726',
                }}>
                <Flame className="w-4 h-4" style={{ color: '#ff4500' }} />
                Trusted by 500+ Restaurants Across India
                <Zap className="w-3.5 h-3.5" />
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-black leading-[1.02] tracking-tight"
                style={{ fontSize: 'clamp(44px, 6vw, 76px)', color: '#fef3e2' }}>
                Your Restaurant.
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #fff8e1 0%, #ffd54f 20%, #ff8f00 55%, #ff3d00 85%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Your Control.
                </span>
                <br />
                One Platform.
              </h1>
            </motion.div>

            {/* Typing line */}
            <motion.p
              className="text-xl sm:text-2xl font-semibold"
              style={{ color: '#c9956a' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            >
              Smarter{' '}
              <AnimatePresence mode="wait">
                <motion.span
                  key={typed}
                  className="font-black"
                  style={{ color: '#ff6a1a' }}
                  initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
                >
                  {typed}
                </motion.span>
              </AnimatePresence>
              <span className="inline-block w-0.5 h-[0.9em] ml-0.5 align-middle animate-pulse"
                style={{ background: '#ff4500' }} />
              {' '}Management
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-lg leading-relaxed"
              style={{ color: '#c9956a' }}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              From the first order to the final bill — Restro OS runs your entire
              restaurant: orders, billing, table bookings, staff, and live analytics.
              <br />
              <strong style={{ color: '#fef3e2' }}>No chaos. No confusion. Just results.</strong>
            </motion.p>

            {/* CTAs */}
            <motion.div className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Link href="/restaurant/signup">
                <motion.button
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-white text-base transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #ff4500, #ff8f00)',
                    boxShadow: '0 8px 32px rgba(255,69,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                  whileHover={{ scale: 1.04, boxShadow: '0 12px 48px rgba(255,69,0,0.55), inset 0 1px 0 rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Flame className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                  Start Free — 14 Days
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base border transition-all"
                  style={{
                    background: 'rgba(255,140,30,0.06)',
                    borderColor: 'rgba(255,140,30,0.25)',
                    color: '#fef3e2',
                  }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(255,140,30,0.45)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Book a Live Demo
                </motion.button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div className="flex flex-wrap items-center gap-5 pt-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              <div className="flex -space-x-2.5">
                {['R', 'S', 'M', 'P', 'A', 'K'].map((l, i) => (
                  <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2"
                    style={{
                      background: `hsl(${10 + i * 12}, 75%, 48%)`,
                      borderColor: 'var(--lp-bg)',
                      zIndex: 6 - i,
                    }}>{l}</div>
                ))}
              </div>
              <div className="border-l pl-4" style={{ borderColor: 'rgba(255,140,30,0.2)' }}>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5" fill="#ffa726" color="#ffa726" />)}
                  <span className="text-xs ml-1 font-bold" style={{ color: '#ffa726' }}>4.9</span>
                </div>
                <p className="text-sm" style={{ color: '#c9956a' }}>
                  <span className="font-black" style={{ color: '#fef3e2' }}>500+</span> restaurants love Restro OS
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#c9956a' }}>
                <span className="text-base">🏆</span> No credit card required
              </div>
            </motion.div>
          </div>

          {/* RIGHT — KOT Card */}
          <motion.div className="relative w-full"
            initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <KOTCard />
          </motion.div>
        </div>

        {/* Bottom feature strip */}
        <motion.div
          className="mt-20 pt-8 border-t"
          style={{ borderColor: 'rgba(255,140,30,0.12)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {[
              { emoji: '🍽️', text: 'Order Management' },
              { emoji: '🧾', text: 'Smart Billing' },
              { emoji: '📅', text: 'Table Booking' },
              { emoji: '📊', text: 'Live Analytics' },
              { emoji: '👨‍🍳', text: 'Staff Control' },
              { emoji: '💳', text: 'Razorpay Payments' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-2 text-sm font-medium"
                style={{ color: '#c9956a' }}>
                <span className="text-base">{f.emoji}</span>
                {f.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
