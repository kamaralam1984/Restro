'use client';

import { motion } from 'framer-motion';
import { X, Check, Flame } from 'lucide-react';

const pains = [
  { emoji: '😤', title: 'Order Mistakes', desc: 'Wrong dishes, missed items, angry customers — every single rush hour.' },
  { emoji: '🧾', title: 'Manual Billing Nightmares', desc: 'Handwritten bills, calculation errors, shortfalls at day end.' },
  { emoji: '📵', title: 'Lost Table Bookings', desc: 'No system = double bookings, missed reservations, empty tables.' },
  { emoji: '😵', title: 'Zero Revenue Visibility', desc: 'No clue which item earns the most or when your busiest hours are.' },
  { emoji: '👻', title: 'Staff Accountability', desc: 'No logs, no tracking — cash shortages and no way to find out.' },
];

const fixes = [
  { emoji: '✅', title: 'Digital Orders — Zero Errors', desc: 'Table → Kitchen in seconds. No miscommunication, ever.' },
  { emoji: '⚡', title: 'Auto Billing with GST', desc: 'Bills generated instantly. Discounts, split bills, UPI — all handled.' },
  { emoji: '📅', title: 'Smart Booking System', desc: 'Online + walk-in managed automatically. No double bookings.' },
  { emoji: '📈', title: 'Live Revenue Dashboard', desc: 'Peak hours, top dishes, daily revenue — all real-time.' },
  { emoji: '🔐', title: 'Role-Based Access Logs', desc: 'Every action logged. Admin, cashier, staff — separate access.' },
];

const card = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function ProblemSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" style={{ background: 'var(--lp-surface)' }}>
      {/* Top diagonal line */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,100,0,0.3), transparent)' }} />

      <div className="container mx-auto px-4 sm:px-6">

        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-4 px-3 py-1.5 rounded-full border"
            style={{ color: '#ffa726', borderColor: 'rgba(255,120,0,0.25)', background: 'rgba(255,80,0,0.08)' }}>
            <Flame className="w-3.5 h-3.5" style={{ color: '#ff4500' }} />
            Sound Familiar?
          </div>
          <h2 className="font-extrabold leading-tight mb-4"
            style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: '#fef3e2' }}>
            Every Restaurant Owner
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #ff4500, #ff8f00)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Knows This Pain</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#c9956a' }}>
            These 5 problems kill restaurant profits every single day. Restro OS eliminates all of them.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_64px_1fr] gap-6 lg:gap-0 items-start max-w-5xl mx-auto">

          {/* Pain */}
          <motion.div className="space-y-3"
            initial="hidden" whileInView="show" viewport={{ once: true }}
            transition={{ staggerChildren: 0.09 }}>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-5"
              style={{ color: '#ff4444' }}>
              <X className="w-4 h-4" /> The Daily Struggle
            </p>
            {pains.map(p => (
              <motion.div key={p.title} variants={card}
                className="flex gap-4 rounded-2xl border p-4 transition-all group cursor-default"
                style={{ background: 'var(--lp-bg)', borderColor: 'var(--lp-border)' }}
                whileHover={{ borderColor: 'rgba(255,68,68,0.3)', scale: 1.01 }}>
                <span className="text-2xl flex-shrink-0 mt-0.5">{p.emoji}</span>
                <div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: '#fef3e2' }}>{p.title}</p>
                  <p className="text-sm" style={{ color: '#c9956a' }}>{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* VS divider */}
          <div className="hidden lg:flex flex-col items-center justify-center h-full pt-14 gap-2">
            <div className="flex-1 w-px" style={{ background: 'rgba(255,140,30,0.15)' }} />
            <div className="w-10 h-10 rounded-full border flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: 'var(--lp-bg)', borderColor: 'rgba(255,140,30,0.25)', color: '#7d5030' }}>
              VS
            </div>
            <div className="flex-1 w-px" style={{ background: 'rgba(255,140,30,0.15)' }} />
          </div>

          <div className="lg:hidden flex items-center gap-4 -my-2">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,140,30,0.15)' }} />
            <span className="text-xs font-black px-3 py-1 rounded-full border"
              style={{ background: 'var(--lp-bg)', borderColor: 'rgba(255,140,30,0.25)', color: '#7d5030' }}>VS</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,140,30,0.15)' }} />
          </div>

          {/* Fixes */}
          <motion.div className="space-y-3"
            initial="hidden" whileInView="show" viewport={{ once: true }}
            transition={{ staggerChildren: 0.09 }}>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-5"
              style={{ color: '#4caf50' }}>
              <Check className="w-4 h-4" /> The Restro OS Way
            </p>
            {fixes.map((f, i) => (
              <motion.div key={f.title} variants={card}
                className="flex gap-4 rounded-2xl border p-4 transition-all cursor-default"
                style={{
                  background: 'var(--lp-bg)',
                  borderColor: i === 0 ? 'rgba(76,175,80,0.25)' : 'var(--lp-border)',
                }}
                whileHover={{ borderColor: 'rgba(76,175,80,0.3)', scale: 1.01 }}>
                <span className="text-2xl flex-shrink-0 mt-0.5">{f.emoji}</span>
                <div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: '#fef3e2' }}>{f.title}</p>
                  <p className="text-sm" style={{ color: '#c9956a' }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.p className="text-center text-xl font-black mt-16"
          style={{ color: '#ffa726' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }}>
          🔥 One platform. Five problems solved. Instantly.
        </motion.p>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,100,0,0.2), transparent)' }} />
    </section>
  );
}
