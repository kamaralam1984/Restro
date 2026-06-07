'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const features = [
  {
    emoji: '🍽️',
    title: 'Smart Order Management',
    desc: 'Table orders flow directly to the kitchen screen. Track status live, edit items, handle multiple tables — zero paper chaos.',
    wide: true,
    accent: '#ff4500',
    tag: 'Core Feature',
  },
  {
    emoji: '📊',
    title: 'Live Revenue Analytics',
    desc: 'Real-time dashboard: peak hours, top dishes, daily/weekly/monthly revenue — all at a glance.',
    accent: '#ff8f00',
    tag: 'Business Intelligence',
  },
  {
    emoji: '🧾',
    title: 'Instant Billing + GST',
    desc: 'Auto-bills with GST, discounts, split payments. Print or WhatsApp receipts instantly.',
    accent: '#4caf50',
    tag: 'Billing',
  },
  {
    emoji: '📅',
    title: 'Table Booking System',
    desc: 'Online reservations + walk-ins managed smartly. Zero double bookings guaranteed.',
    accent: '#00bcd4',
    tag: 'Reservations',
  },
  {
    emoji: '👨‍🍳',
    title: 'Staff & Role Control',
    desc: 'Admin, Manager, Cashier, Staff — each role has its own access. Every action is tracked.',
    accent: '#9c27b0',
    tag: 'Team Management',
  },
  {
    emoji: '💳',
    title: 'Razorpay + UPI Payments',
    desc: 'Card, UPI, cash — all payment modes with real-time reconciliation.',
    accent: '#ff4081',
    tag: 'Payments',
  },
  {
    emoji: '📱',
    title: 'WhatsApp Notifications',
    desc: 'Instant WhatsApp alerts for orders, bookings, and updates. No app install needed.',
    accent: '#25d366',
    tag: 'Communication',
  },
  {
    emoji: '🌐',
    title: 'Your Own Online Menu',
    desc: 'Share your custom menu link with customers. They order online, you get notified instantly.',
    accent: '#ffa726',
    tag: 'Online Presence',
  },
];

const foodGallery = [
  {
    src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=85&fit=crop',
    caption: '🍗 Indian Cuisine',
  },
  {
    src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=85&fit=crop',
    caption: '🍕 Fast Food',
  },
  {
    src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=85&fit=crop',
    caption: '🥗 Healthy Bowls',
  },
  {
    src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85&fit=crop',
    caption: '🌮 World Cuisine',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 scroll-mt-20"
      style={{ background: 'var(--lp-bg)' }}>
      <div className="container mx-auto px-4 sm:px-6">

        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-4 px-3 py-1.5 rounded-full border"
            style={{ color: '#ffa726', borderColor: 'rgba(255,120,0,0.25)', background: 'rgba(255,80,0,0.08)' }}>
            🍴 Our Specialties
          </div>
          <h2 className="font-extrabold leading-tight mb-4"
            style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: '#fef3e2' }}>
            Everything Your Restaurant
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #fff8e1 0%, #ffd54f 25%, #ff8f00 55%, #ff3d00 85%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Needs to Thrive</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#c9956a' }}>
            Built specifically for Indian restaurants. No bloat. No fluff. Just what works.
          </p>
        </motion.div>

        {/* Food Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-14">
          {foodGallery.map((item, i) => (
            <motion.div
              key={item.caption}
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              <div className="relative rounded-2xl overflow-hidden aspect-square">
                <motion.div
                  className="absolute inset-0"
                  whileHover={{ scale: 1.07 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </motion.div>
              </div>
              <p className="text-center text-sm font-semibold" style={{ color: '#ffd580' }}>
                {item.caption}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className={`group relative rounded-2xl border p-6 overflow-hidden transition-all${f.wide ? ' lg:col-span-2' : ''}`}
              style={{ background: 'var(--lp-surface)', borderColor: 'var(--lp-border)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.08, 0.4) }}
              whileHover={{ borderColor: `${f.accent}40`, scale: 1.015 }}
            >
              {/* Hover bg glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 15% 15%, ${f.accent}08, transparent 65%)` }} />

              {/* Tag */}
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-4"
                style={{ background: `${f.accent}15`, color: f.accent }}>
                {f.tag}
              </span>

              {/* Emoji + title */}
              <div className="flex items-start gap-4 mb-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border"
                  style={{ background: `${f.accent}12`, borderColor: `${f.accent}20` }}>
                  {f.emoji}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1.5" style={{ color: '#fef3e2' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#c9956a' }}>{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div className="text-center mt-12"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-2xl border"
            style={{ background: 'var(--lp-surface)', borderColor: 'var(--lp-border)', color: '#c9956a' }}>
            🏆 All features included in every plan — no hidden charges
          </p>
        </motion.div>
      </div>
    </section>
  );
}
