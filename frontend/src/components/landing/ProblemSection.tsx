'use client';

import { motion } from 'framer-motion';

const painPoints = [
  'Order mistakes',
  'Lost table bookings',
  'No clear revenue tracking',
  'Staff misuse & no reporting',
  'Manual billing confusion',
];

export default function ProblemSection() {
  return (
    <section className="py-20 bg-slate-900/50 border-y border-slate-800">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-white mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Tired of Managing Everything Manually?
        </motion.h2>
        <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10">
          {painPoints.map((point, i) => (
            <motion.li
              key={point}
              className="flex items-center gap-2 text-slate-300 text-lg"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="text-red-400">❌</span>
              {point}
            </motion.li>
          ))}
        </ul>
        <motion.p
          className="text-xl text-orange-400 font-semibold"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Restro OS fixes all of this.
        </motion.p>
      </div>
    </section>
  );
}
