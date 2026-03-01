'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Clock, BarChart3, UserMinus } from 'lucide-react';

const benefits = [
  { icon: TrendingUp, text: 'Increase order efficiency by 30%' },
  { icon: DollarSign, text: 'Reduce billing errors' },
  { icon: Clock, text: 'Save 3+ hours daily' },
  { icon: BarChart3, text: 'Data-driven decisions' },
  { icon: UserMinus, text: 'Reduce staff dependency' },
];

export default function ROISection() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          How Restro OS Increases Your Profit
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
          {benefits.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.text}
                className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-900/40 px-6 py-4"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-slate-200 font-medium">{item.text}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
