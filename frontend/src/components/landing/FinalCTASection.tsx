'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

export default function FinalCTASection() {
  return (
    <section className="py-24 bg-slate-900/50 border-t border-slate-800">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to Upgrade Your Restaurant?
        </motion.h2>
        <motion.p
          className="text-slate-400 text-lg mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Join hundreds of restaurants running on Restro OS.
        </motion.p>
        <Link href="/restaurant/signup">
          <motion.button
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-orange-500/25 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Rocket className="w-5 h-5" />
            Start Your Free Trial Today
          </motion.button>
        </Link>
      </div>
    </section>
  );
}
