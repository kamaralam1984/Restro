'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';

const features = [
  { emoji: '⚡', title: 'Lightning-Fast Order Flow', desc: 'From table to kitchen in seconds. No missed orders, no paper slips, no chaos during rush hour.' },
  { emoji: '📊', title: 'Real-Time Revenue Insights', desc: 'See your peak hours, top dishes, and daily earnings — right from your phone, anywhere.' },
  { emoji: '🧑‍🍳', title: 'Kitchen Display System', desc: 'Your kitchen staff sees orders the moment placed. Accurate, prioritized, timestamped.' },
  { emoji: '🔔', title: 'Smart Alerts & Notifications', desc: 'Get notified on new orders, bookings, and daily summaries so you\'re always ahead.' },
];

const marqueeItems = [
  { emoji: '🍕', label: 'Pizza Places' },
  { emoji: '🍔', label: 'Burger Joints' },
  { emoji: '🍜', label: 'Dhabas' },
  { emoji: '🍛', label: 'Fine Dining' },
  { emoji: '🥘', label: 'Cloud Kitchens' },
  { emoji: '🫖', label: 'Cafés' },
  { emoji: '🍱', label: 'Tiffin Services' },
  { emoji: '🧆', label: 'QSR Chains' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
  }),
};

export default function ShowcaseSection() {
  const doubled = [...marqueeItems, ...marqueeItems];

  return (
    <section className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: 'var(--lp-surface)' }}>

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: '#ff4500' }} />
      <div className="pointer-events-none absolute -bottom-40 -right-20 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: '#ff8f00' }} />

      <div className="relative container mx-auto px-4 sm:px-6">

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">

          {/* Left: content */}
          <div className="order-2 lg:order-1 flex flex-col gap-7">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
              className="inline-flex items-center gap-2 self-start rounded-full px-4 py-1.5 text-sm font-bold border"
              style={{ background: 'rgba(255,69,0,0.1)', color: '#ffa726', borderColor: 'rgba(255,100,0,0.25)' }}>
              <Flame size={14} style={{ color: '#ff4500' }} />
              Why Restaurant Owners Choose Us
            </motion.div>

            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
              className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight"
              style={{ color: '#fef3e2' }}>
              The Restaurant OS That Works{' '}
              <span style={{
                background: 'linear-gradient(135deg, #ffd54f, #ff8f00, #ff3d00)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                As Hard As You Do
              </span>
            </motion.h2>

            <ul className="flex flex-col gap-5">
              {features.map((f, i) => (
                <motion.li key={f.title} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} custom={i + 2} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl border"
                    style={{ background: 'var(--lp-bg)', borderColor: 'var(--lp-border)' }}>
                    {f.emoji}
                  </span>
                  <div>
                    <p className="font-bold text-base mb-0.5" style={{ color: '#fef3e2' }}>{f.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#c9956a' }}>{f.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6}>
              <Link href="/restaurant/signup">
                <motion.button
                  className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-bold text-base text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #ff4500, #ff8f00)', boxShadow: '0 8px 32px rgba(255,69,0,0.35)' }}
                  whileHover={{ scale: 1.04, boxShadow: '0 12px 48px rgba(255,69,0,0.5)' }}
                  whileTap={{ scale: 0.97 }}>
                  Start Free Today
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right: video embed */}
          <motion.div
            className="order-1 lg:order-2 w-full"
            initial={{ opacity: 0, scale: 0.93 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border"
              style={{
                borderColor: 'rgba(255,140,30,0.25)',
                boxShadow: '0 32px 80px rgba(255,60,0,0.2)',
                aspectRatio: '16/9',
              }}>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,140,30,0.2)' }} />
              <iframe
                src="https://www.pexels.com/video/people-at-the-restaurant-852179/embed/"
                title="Restaurant showcase"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <p className="mt-4 text-center text-sm font-medium" style={{ color: '#c9956a' }}>
              🍽️ Trusted by 500+ restaurants across India
            </p>
          </motion.div>
        </div>

        {/* Restaurant type marquee */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <p className="text-center text-xs font-bold uppercase tracking-[0.15em] mb-5"
            style={{ color: '#7d5030' }}>
            Works for every restaurant type
          </p>
          <div className="relative overflow-hidden rounded-2xl py-4 border"
            style={{ background: 'var(--lp-bg)', borderColor: 'var(--lp-border)' }}>
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10"
              style={{ background: 'linear-gradient(to right, var(--lp-bg), transparent)' }} />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10"
              style={{ background: 'linear-gradient(to left, var(--lp-bg), transparent)' }} />
            <div className="flex animate-marquee whitespace-nowrap">
              {doubled.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 mx-8 text-base font-bold"
                  style={{ color: '#fef3e2' }}>
                  <span className="text-2xl">{item.emoji}</span>
                  {item.label}
                  <span className="ml-6 opacity-25" style={{ color: '#ff8f00' }}>·</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
