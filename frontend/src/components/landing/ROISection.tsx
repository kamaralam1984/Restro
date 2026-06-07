'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function useCountUp(to: number, dur = 1800, go = false) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go) return;
    let v = 0;
    const step = to / (dur / 16);
    const t = setInterval(() => {
      v += step;
      if (v >= to) { setN(to); clearInterval(t); }
      else setN(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [to, dur, go]);
  return n;
}

const stats = [
  { emoji: '🏪', num: 500, suf: '+', label: 'Restaurants', sub: 'Active on Restro OS pan-India', color: '#f0c060' },
  { emoji: '📈', num: 30, suf: '%', label: 'Order Efficiency', sub: 'Improvement reported by owners', color: '#c8972a' },
  { emoji: '💰', num: 50, suf: 'L+', label: 'Monthly Revenue', sub: 'Tracked across the platform', color: '#e8d5a0' },
  { emoji: '⏰', num: 4, suf: 'hrs', label: 'Saved Per Day', sub: 'Per restaurant, every day', color: '#4caf50' },
];

function Stat({ s, i }: { s: typeof stats[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const n = useCountUp(s.num, 1600, inView);
  return (
    <motion.div ref={ref}
      className="relative rounded-2xl border p-7 overflow-hidden text-center group"
      style={{ background: 'var(--lp-surface)', borderColor: 'var(--lp-border)' }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: i * 0.1 }}
      whileHover={{ borderColor: `${s.color}45`, scale: 1.03, y: -4, boxShadow: '0 12px 32px rgba(200,151,42,0.2)' }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}08, transparent 70%)` }} />
      <div className="text-4xl mb-3">{s.emoji}</div>
      <div className="text-5xl sm:text-6xl font-black mb-2 leading-none"
        style={{
          background: `linear-gradient(135deg, #f0c060, ${s.color})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
        {n}{s.suf}
      </div>
      <div className="text-base font-bold mb-1" style={{ color: 'var(--lp-text)' }}>{s.label}</div>
      <div className="text-sm" style={{ color: 'var(--lp-text-2)' }}>{s.sub}</div>
    </motion.div>
  );
}

export default function ROISection() {
  return (
    <section className="py-24 sm:py-32 relative" style={{ background: 'var(--lp-surface)' }}>
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,151,42,0.25), transparent)' }} />

      <div className="container mx-auto px-4 sm:px-6">
        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-4 px-3 py-1.5 rounded-full border"
            style={{ color: '#f0c060', borderColor: 'rgba(200,151,42,0.25)', background: 'rgba(200,151,42,0.08)' }}>
            🔥 Real Numbers
          </div>
          <h2 className="font-extrabold leading-tight mb-4"
            style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: 'var(--lp-text)' }}>
            Results That Speak
            <br />
            <span style={{ color: 'var(--lp-accent)' }}>Louder Than Words</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--lp-text-2)' }}>
            Real numbers from real restaurant owners who made the switch.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {stats.map((s, i) => <Stat key={s.label} s={s} i={i} />)}
        </div>

        {/* Callout quote */}
        <motion.div
          className="mt-14 max-w-2xl mx-auto rounded-2xl border p-8 text-center relative overflow-hidden"
          style={{ background: 'var(--lp-bg)', borderColor: 'rgba(200,151,42,0.2)' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,151,42,0.08), transparent 70%)' }} />
          <div className="text-5xl mb-4" style={{ color: 'rgba(200,151,42,0.35)', lineHeight: 1 }}>"</div>
          <p className="text-xl font-medium italic leading-relaxed mb-6" style={{ color: 'var(--lp-text)' }}>
            Billing errors dropped by 90% in the first week. My cashier used to spend 2 hours reconciling — now it takes 10 minutes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base"
              style={{ background: 'linear-gradient(135deg, #8b5a00, #c8972a)' }}>R</div>
            <div className="text-left">
              <p className="font-bold text-sm" style={{ color: 'var(--lp-text)' }}>Rajesh Sharma</p>
              <p className="text-xs" style={{ color: 'var(--lp-text-2)' }}>Owner, Sharma Dhaba — Jaipur</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
