'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Restro OS transformed our billing completely. Errors dropped to zero — our cashier is finally stress-free at end of shift.",
    name: 'Rajesh Sharma', role: 'Owner', restaurant: 'Sharma Dhaba', city: 'Jaipur',
    avatar: 'R', color: '#c8972a', rating: 5,
  },
  {
    quote: "Table booking used to be a nightmare. Now everything is automated and our weekends are fully packed with zero double bookings.",
    name: 'Priya Mehta', role: 'Manager', restaurant: 'Spice Route Café', city: 'Pune',
    avatar: 'P', color: '#d4a030', rating: 5,
  },
  {
    quote: "I finally know which dishes make the most money and when my rush hours are. The analytics alone are worth every rupee.",
    name: 'Ankit Verma', role: 'Owner', restaurant: 'The Brown Bun', city: 'Delhi',
    avatar: 'A', color: '#4caf50', rating: 5,
  },
  {
    quote: "Setup was incredibly quick — we were live in 2 hours. The support team was helpful and the product just works.",
    name: 'Sunita Agarwal', role: 'Co-Owner', restaurant: 'Agarwal Family Kitchen', city: 'Ahmedabad',
    avatar: 'S', color: '#00bcd4', rating: 5,
  },
  {
    quote: "Revenue visibility increased 10x after switching. I check the dashboard every morning — it's addictive knowing your numbers live.",
    name: 'Mohammad Farhan', role: 'Owner', restaurant: "Farhan's Biryani House", city: 'Hyderabad',
    avatar: 'M', color: '#e8d5a0', rating: 5,
  },
  {
    quote: "Staff management became so much easier. Every action is tracked — no more guessing what happened during a busy shift.",
    name: 'Kavita Patel', role: 'Operations Head', restaurant: "Patel's Fine Dining", city: 'Surat',
    avatar: 'K', color: '#e91e63', rating: 5,
  },
];

function Card({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-80 sm:w-96 rounded-2xl p-6 flex flex-col gap-4 transition-all hover:scale-[1.02]"
      style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', boxShadow: '0 2px 16px rgba(0,0,0,0.14)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(200,151,42,0.15)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.14)'; }}>
      <div className="flex gap-0.5">
        {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4" fill="#f0c060" color="#f0c060" />)}
      </div>
      <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--lp-text-2)' }}>"{t.quote}"</p>
      <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'rgba(200,151,42,0.15)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
          {t.avatar}
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--lp-text)' }}>{t.name}</p>
          <p className="text-xs" style={{ color: 'var(--lp-text-2)' }}>{t.role} · {t.restaurant}</p>
          <p className="text-xs" style={{ color: 'var(--lp-text-3)' }}>📍 {t.city}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const doubled = [...testimonials, ...testimonials];
  return (
    <section className="py-24 sm:py-32 overflow-hidden" style={{ background: 'var(--lp-bg)' }}>
      <div className="container mx-auto px-4 sm:px-6 mb-12">
        <motion.div className="text-center"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-4 px-3 py-1.5 rounded-full border"
            style={{ color: '#f0c060', borderColor: 'rgba(200,151,42,0.25)', background: 'rgba(200,151,42,0.08)' }}>
            ⭐ Guest Reviews
          </div>
          <h2 className="font-extrabold leading-tight mb-4"
            style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: 'var(--lp-text)' }}>
            500+ Restaurant Owners
            <br />
            <span style={{ color: 'var(--lp-accent)' }}>Love Restro OS</span>
          </h2>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--lp-bg), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--lp-bg), transparent)' }} />
        <div className="flex gap-4 animate-marquee" style={{ width: 'max-content', paddingLeft: '1rem' }}>
          {doubled.map((t, i) => <Card key={`${t.name}-${i}`} t={t} />)}
        </div>
      </div>

      <motion.div className="container mx-auto px-4 sm:px-6 mt-12"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {[['⭐ 4.9/5', 'Average rating'], ['500+', 'Verified reviews'], ['98%', 'Would recommend']].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-2xl font-black mb-0.5" style={{ color: '#f0c060' }}>{v}</p>
              <p className="text-xs" style={{ color: 'var(--lp-text-2)' }}>{l}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
