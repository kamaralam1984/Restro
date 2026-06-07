'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { LayoutDashboard, ShoppingCart, BarChart3, Receipt, Settings } from 'lucide-react';

const INTERIOR_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85&fit=crop';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders',    label: 'Orders',    icon: ShoppingCart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'billing',   label: 'Billing',   icon: Receipt },
];

function DashboardScreen() {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Today's Orders", v: '142', c: '#f97316' },
          { l: 'Revenue Today', v: '₹32.4k', c: '#22c55e' },
          { l: 'Tables Active', v: '11/16', c: '#60a5fa' },
          { l: 'Pending Bills', v: '3', c: '#f59e0b' },
        ].map(s => (
          <div key={s.l} className="rounded-xl p-3" style={{ background: 'var(--lp-surface2)' }}>
            <p className="text-[10px] mb-1" style={{ color: 'var(--lp-text-3)' }}>{s.l}</p>
            <p className="text-lg font-black" style={{ color: s.c }}>{s.v}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Revenue chart */}
        <div className="rounded-xl p-3" style={{ background: 'var(--lp-surface2)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--lp-text-3)' }}>Weekly Revenue</p>
          <div className="flex items-end gap-1.5 h-20">
            {[60, 82, 70, 95, 77, 88, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-sm"
                  style={{ height: `${h * 0.8}%`, background: 'linear-gradient(to top, #f97316, #fb923c)', transformOrigin: 'bottom' }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
                />
                <span className="text-[8px]" style={{ color: 'var(--lp-text-3)' }}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Top items */}
        <div className="rounded-xl p-3" style={{ background: 'var(--lp-surface2)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--lp-text-3)' }}>Top Dishes</p>
          <div className="space-y-2">
            {[
              { n: 'Butter Chicken', p: 90, v: '₹8,200' },
              { n: 'Paneer Tikka', p: 74, v: '₹6,100' },
              { n: 'Dal Makhani', p: 55, v: '₹4,400' },
            ].map(item => (
              <div key={item.n}>
                <div className="flex justify-between text-[9px] mb-0.5">
                  <span style={{ color: 'var(--lp-text)' }}>{item.n}</span>
                  <span style={{ color: 'var(--lp-text-2)' }}>{item.v}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--lp-bg)' }}>
                  <motion.div className="h-full rounded-full" style={{ background: '#f97316' }}
                    initial={{ width: 0 }} animate={{ width: `${item.p}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersScreen() {
  const orders = [
    { id: '#0142', table: 'T-03', items: 'Butter Chicken, Naan, Lassi', amt: '₹680', s: 'Ready', sc: '#22c55e' },
    { id: '#0141', table: 'T-07', items: 'Veg Biryani, Raita', amt: '₹420', s: 'Preparing', sc: '#f59e0b' },
    { id: '#0140', table: 'T-11', items: 'Dal Fry, Rice, Salad', amt: '₹310', s: 'New', sc: '#60a5fa' },
    { id: '#0139', table: 'T-02', items: 'Paneer Tikka', amt: '₹280', s: 'Delivered', sc: '#9998b2' },
    { id: '#0138', table: 'T-08', items: 'Chicken Curry, Paratha', amt: '₹520', s: 'Paid', sc: '#a78bfa' },
  ];
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold" style={{ color: 'var(--lp-text)' }}>Live Orders — Today</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--lp-accent-dim)', color: 'var(--lp-accent)' }}>142 total</span>
      </div>
      <div className="space-y-2">
        {orders.map(o => (
          <div key={o.id} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: 'var(--lp-surface2)' }}>
            <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--lp-text-3)' }}>{o.id}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--lp-bg)', color: 'var(--lp-text)' }}>{o.table}</span>
            <span className="text-[10px] flex-1 truncate" style={{ color: 'var(--lp-text-2)' }}>{o.items}</span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--lp-text)' }}>{o.amt}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${o.sc}18`, color: o.sc }}>{o.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: 'This Month', v: '₹4.8L', d: '+18%' },
          { l: 'Avg Order', v: '₹428', d: '+8%' },
          { l: 'Repeat Guests', v: '64%', d: '+12%' },
        ].map(s => (
          <div key={s.l} className="rounded-xl p-3" style={{ background: 'var(--lp-surface2)' }}>
            <p className="text-[9px] mb-1" style={{ color: 'var(--lp-text-3)' }}>{s.l}</p>
            <p className="text-base font-black" style={{ color: 'var(--lp-text)' }}>{s.v}</p>
            <p className="text-[9px]" style={{ color: '#22c55e' }}>{s.d}</p>
          </div>
        ))}
      </div>
      {/* Peak hours */}
      <div className="rounded-xl p-3" style={{ background: 'var(--lp-surface2)' }}>
        <p className="text-[9px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--lp-text-3)' }}>Peak Hours</p>
        <div className="flex items-end gap-1 h-16">
          {[10, 25, 45, 80, 60, 55, 95, 85, 70, 40, 30, 20, 15, 18, 22].map((h, i) => (
            <motion.div key={i} className="flex-1 rounded-sm"
              style={{ background: h > 70 ? '#f97316' : 'var(--lp-surface)', height: `${h}%`, opacity: 0.7 + i * 0.02, transformOrigin: 'bottom' }}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.04, duration: 0.35 }} />
          ))}
        </div>
        <div className="flex justify-between text-[8px] mt-1" style={{ color: 'var(--lp-text-3)' }}>
          <span>10am</span><span>1pm</span><span>4pm</span><span>7pm</span><span>12am</span>
        </div>
      </div>
    </div>
  );
}

function BillingScreen() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold" style={{ color: 'var(--lp-text)' }}>Today's Bills</p>
        <span className="text-[10px]" style={{ color: '#22c55e' }}>₹32,400 collected</span>
      </div>
      <div className="space-y-2 mb-4">
        {[
          { id: 'B-0095', t: 'Table 7', items: 4, total: '₹1,240', m: 'UPI', s: 'Paid' },
          { id: 'B-0094', t: 'Table 3', items: 2, total: '₹680', m: 'Cash', s: 'Paid' },
          { id: 'B-0093', t: 'Table 11', items: 3, total: '₹940', m: 'Card', s: 'Pending' },
        ].map(b => (
          <div key={b.id} className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: 'var(--lp-surface2)' }}>
            <span className="text-[10px] font-mono" style={{ color: 'var(--lp-text-3)' }}>{b.id}</span>
            <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: 'var(--lp-text)' }}>{b.t}</span>
            <span className="text-[10px] flex-1" style={{ color: 'var(--lp-text-2)' }}>{b.items} items</span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--lp-text)' }}>{b.total}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--lp-bg)', color: 'var(--lp-text-3)' }}>{b.m}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: b.s === 'Paid' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: b.s === 'Paid' ? '#22c55e' : '#f59e0b' }}>{b.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const screens: Record<string, React.ReactNode> = {
  dashboard: <DashboardScreen />,
  orders: <OrdersScreen />,
  analytics: <AnalyticsScreen />,
  billing: <BillingScreen />,
};

function InteriorBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Subtle parallax: image moves slightly slower than the scroll
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.06, 1.02, 1.06]);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden h-64 sm:h-80"
    >
      {/* Parallax image */}
      <motion.div
        className="absolute inset-0"
        style={{ y: imageY, scale: imageScale }}
      >
        <Image
          src={INTERIOR_IMAGE}
          alt="restaurant interior"
          fill
          className="object-cover"
          unoptimized
        />
      </motion.div>

      {/* Dark overlay: subtle top-to-bottom gradient fading into section bg */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 50%, var(--lp-bg, #0f0f0f) 100%)',
        }}
      />

      {/* Overlay text */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <motion.p
          className="text-center text-xl sm:text-3xl font-extrabold tracking-tight leading-snug drop-shadow-lg"
          style={{ color: '#ffffff' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Your Dashboard.&nbsp; Your Restaurant.&nbsp; In Real&nbsp;Time.
        </motion.p>
      </div>
    </div>
  );
}

export default function DemoSection() {
  const [active, setActive] = useState('dashboard');

  return (
    <section className="relative" style={{ background: 'var(--lp-surface)' }}>
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--lp-border), transparent)' }} />

      {/* Decorative restaurant interior banner */}
      <InteriorBanner />

      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] mb-4 px-3 py-1 rounded-full border"
              style={{ color: 'var(--lp-accent)', borderColor: 'rgba(249,115,22,0.2)', background: 'var(--lp-accent-dim)' }}>
              Live Preview
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4" style={{ color: 'var(--lp-text)' }}>
              See Exactly What You'll Get
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--lp-text-2)' }}>
              This is the real Restro OS dashboard. Explore each section — no mockup, no fluff.
            </p>
          </motion.div>

          {/* App window */}
          <motion.div
            className="max-w-4xl mx-auto rounded-2xl overflow-hidden border shadow-2xl"
            style={{
              background: 'var(--lp-bg)',
              borderColor: 'var(--lp-border)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
            }}
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: 'var(--lp-surface2)', borderColor: 'var(--lp-border)' }}>
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-amber-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
              <div className="flex-1 mx-4 h-6 rounded-lg px-3 flex items-center"
                style={{ background: 'var(--lp-bg)' }}>
                <Settings className="w-3 h-3 mr-1.5" style={{ color: 'var(--lp-text-3)' }} />
                <span className="text-[11px]" style={{ color: 'var(--lp-text-3)' }}>app.restroos.com/admin/dashboard</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--lp-border)', background: 'var(--lp-surface)' }}>
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = active === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActive(tab.id)}
                    className="flex items-center gap-1.5 px-5 py-3 text-xs font-medium transition-all whitespace-nowrap relative border-b-2"
                    style={{
                      color: isActive ? 'var(--lp-accent)' : 'var(--lp-text-2)',
                      borderBottomColor: isActive ? 'var(--lp-accent)' : 'transparent',
                      background: isActive ? 'var(--lp-accent-dim)' : 'transparent',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Screen content */}
            <div style={{ minHeight: 300 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {screens[active]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--lp-border), transparent)' }} />
    </section>
  );
}
