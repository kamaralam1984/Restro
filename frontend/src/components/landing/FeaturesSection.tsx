'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Package,
  CreditCard,
  BarChart3,
  CalendarCheck,
  Users,
  Wallet,
} from 'lucide-react';

type FeatureItem = {
  icon: typeof Package;
  image?: string | null;
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  { icon: Package, title: 'Smart Order Management', description: 'Track every order in real time.' },
  { icon: CreditCard, title: 'Built-in Billing System', description: 'Online + Walk-in billing.' },
  { icon: BarChart3, title: 'Powerful Analytics', description: 'Know your peak hours, best-selling items.' },
  { icon: CalendarCheck, title: 'Table Booking Automation', description: 'No double bookings.' },
  { icon: Users, title: 'Staff & Role Control', description: 'Admin / Staff access control.' },
  { icon: Wallet, title: 'Payment Integration', description: 'Razorpay and offline payments.' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-950 scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Everything You Need in One Platform
        </motion.h2>
        <motion.p
          className="text-slate-400 text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Solution section — features explained simply.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur p-6 hover:border-orange-500/30 hover:bg-slate-800/40 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <div className="mb-4 flex justify-start">
                  {feature.image ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden ring-2 ring-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-slate-800/80 ring-2 ring-orange-500/60 shadow-[0_0_24px_rgba(249,115,22,0.25)] [&_svg]:stroke-[1.5]">
                      <Icon className="w-7 h-7 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
