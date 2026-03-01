'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: '₹1,999',
    period: '/month',
    features: ['Orders', 'Menu management'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹3,999',
    period: '/month',
    features: ['Orders', 'Billing', 'Table Booking'],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Premium',
    price: '₹6,999',
    period: '/month',
    features: ['Full system', 'Analytics', 'Priority Support'],
    cta: 'Get Started',
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-slate-900/50 border-y border-slate-800 scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Simple, Transparent Pricing
        </motion.h2>
        <motion.p
          className="text-slate-400 text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Choose the plan that fits your restaurant.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl border backdrop-blur p-6 flex flex-col ${
                plan.popular
                  ? 'border-orange-500/50 bg-slate-900/80 shadow-lg shadow-orange-500/10'
                  : 'border-slate-700/50 bg-slate-900/40'
              }`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-500 text-white text-sm font-medium">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-slate-300">
                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/restaurant/signup">
                <motion.button
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.cta}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
