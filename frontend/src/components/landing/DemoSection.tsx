'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingCart, BarChart3, Receipt } from 'lucide-react';

const screens = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Orders', icon: ShoppingCart },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Billing', icon: Receipt },
];

export default function DemoSection() {
  return (
    <section className="py-24 bg-slate-900/50 border-y border-slate-800">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          See Restro OS in Action
        </motion.h2>
        <motion.p
          className="text-slate-400 text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Dashboard, Orders, Analytics & Billing — all in one place.
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {screens.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="aspect-video bg-slate-800/80 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-slate-500" />
                </div>
                <p className="p-4 text-center font-medium text-slate-300">{item.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
