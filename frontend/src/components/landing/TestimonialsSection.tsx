'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: 'Restro OS helped us increase efficiency by 40%.',
    author: 'XYZ Restaurant',
    role: 'Owner',
  },
  {
    quote: 'Billing and orders in one place — finally no more spreadsheets.',
    author: 'Downtown Bistro',
    role: 'Manager',
  },
  {
    quote: 'Table bookings and analytics saved us 4+ hours every week.',
    author: 'Spice House',
    role: 'Owner',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          What Restaurant Owners Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              className="rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-slate-300 mb-4">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-semibold text-white">{t.author}</p>
              <p className="text-sm text-slate-500">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
