'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, Shield, Clock, CreditCard, Zap } from 'lucide-react';

const perks = [
  { icon: Clock, text: '14-day free trial' },
  { icon: CreditCard, text: 'No credit card needed' },
  { icon: Zap, text: 'Setup in 30 minutes' },
  { icon: Shield, text: 'Cancel anytime' },
];

export default function FinalCTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: 'var(--lp-bg)' }}>

      {/* Fire glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(200,151,42,0.12), transparent 70%)', filter: 'blur(60px)' }} />
        {[12, 32, 52, 70, 86].map((l, i) => (
          <div key={i} className="absolute bottom-0 rounded-full animate-rise"
            style={{
              left: `${l}%`, width: 12, height: 12,
              background: 'rgba(200,151,42,0.15)',
              filter: 'blur(6px)',
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3.5 + i * 0.4}s`,
            }} />
        ))}
      </div>

      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,151,42,0.3), transparent)' }} />

      <div className="container relative mx-auto px-4 sm:px-6 text-center max-w-3xl">

        <motion.div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-6 px-3 py-1.5 rounded-full border"
          style={{ color: '#f0c060', borderColor: 'rgba(200,151,42,0.25)', background: 'rgba(200,151,42,0.08)' }}
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Flame className="w-3.5 h-3.5" style={{ color: '#c8972a' }} /> Get Started Today
        </motion.div>

        <motion.h2
          className="font-extrabold leading-[1.06] mb-6"
          style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: 'var(--lp-text)' }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.65 }}>
          Your Restaurant Deserves
          <br />
          <span style={{ color: 'var(--lp-accent)' }}>
            Better Tools
          </span>
        </motion.h2>

        <motion.p className="text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ color: 'var(--lp-text-2)' }}
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.2 }}>
          Join 500+ restaurant owners who run smarter, earn more, and stress less — with Restro OS.
        </motion.p>

        {/* Hindi note */}
        <motion.p
          className="text-sm mb-8 font-medium"
          style={{ color: '#a89070' }}
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.25 }}>
          Shuru karo 3-day free demo se — koi credit card nahi chahiye
        </motion.p>

        <motion.div className="flex flex-wrap gap-4 justify-center mb-10"
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <Link href="/pricing">
            <motion.button
              className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl font-black text-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                color: '#080808',
                boxShadow: '0 10px 48px rgba(200,151,42,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(240,192,96,0.55)' }}
              whileTap={{ scale: 0.97 }}>
              <Flame className="w-5 h-5" />
              Start Free Trial Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <Link href="/pricing">
            <motion.button
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-lg border transition-all"
              style={{ background: 'transparent', borderColor: 'rgba(200,151,42,0.4)', color: '#f0c060' }}
              whileHover={{ scale: 1.02, background: 'rgba(200,151,42,0.15)', borderColor: 'rgba(200,151,42,0.7)' }}
              whileTap={{ scale: 0.97 }}>
              View Pricing
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <Link href="/contact">
            <motion.button
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-lg border transition-all"
              style={{ background: 'transparent', borderColor: 'rgba(200,151,42,0.25)', color: 'var(--lp-text-2)' }}
              whileHover={{ scale: 1.02, background: 'rgba(200,151,42,0.08)', borderColor: 'rgba(200,151,42,0.5)' }}
              whileTap={{ scale: 0.97 }}>
              Talk to Sales
            </motion.button>
          </Link>
        </motion.div>

        <motion.div className="flex flex-wrap gap-5 justify-center"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.4 }}>
          {perks.map(p => {
            const Icon = p.icon;
            return (
              <div key={p.text} className="flex items-center gap-2 text-sm" style={{ color: 'var(--lp-text-2)' }}>
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#c8972a' }} />
                {p.text}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
