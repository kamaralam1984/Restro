'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChefHat, Rocket, Calendar } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-950">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.15),transparent)]" />

      <div className="container relative mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
            Run Your Restaurant Like a Pro —{' '}
            <span className="bg-gradient-to-r from-orange-500 to-violet-500 bg-clip-text text-transparent">
              All in One System
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-xl">
            Orders, Billing, Bookings, Analytics & Staff Management — Everything in One Powerful Platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/restaurant/signup">
              <motion.button
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-orange-500/25 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Rocket className="w-5 h-5" />
                Start Free Trial
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-600 px-6 py-4 rounded-xl font-semibold backdrop-blur transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Calendar className="w-5 h-5" />
                Book Demo
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl p-4 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-700/50" />
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <div className="h-8 w-24 rounded bg-slate-700/50" />
              <div className="h-8 w-32 rounded bg-orange-500/30" />
            </div>
            <div className="h-48 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
              <ChefHat className="w-16 h-16 text-slate-600" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
