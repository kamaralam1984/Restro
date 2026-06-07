'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const categories = [
  { emoji: '🍔', name: 'Burgers',  count: '12 items', gradient: 'from-yellow-900 to-amber-800',   color: '#c8972a' },
  { emoji: '🍕', name: 'Pizzas',   count: '8 items',  gradient: 'from-orange-900 to-red-900',     color: '#c8972a' },
  { emoji: '🍛', name: 'Biryani',  count: '6 items',  gradient: 'from-amber-900 to-yellow-800',   color: '#c8972a' },
  { emoji: '🍜', name: 'Chinese',  count: '10 items', gradient: 'from-red-900 to-rose-900',       color: '#8b6010' },
  { emoji: '🐔', name: 'Chicken',  count: '9 items',  gradient: 'from-orange-900 to-amber-900',   color: '#c8972a' },
  { emoji: '🥗', name: 'Salads',   count: '5 items',  gradient: 'from-green-900 to-emerald-900',  color: '#c8972a' },
  { emoji: '🧃', name: 'Drinks',   count: '7 items',  gradient: 'from-yellow-900 to-amber-800',   color: '#c8972a' },
  { emoji: '🍰', name: 'Desserts', count: '6 items',  gradient: 'from-rose-900 to-pink-900',      color: '#c8972a' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function CategoryGrid() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCardClick = (name: string) => {
    setActiveCategory(prev => (prev === name ? null : name));
  };

  return (
    <section
      id="menu"
      style={{ backgroundColor: 'var(--rb-surface2)' }}
      className="w-full py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-widest uppercase"
              style={{ color: 'var(--rb-text)' }}>
            Browse Menu
          </h2>
          {/* Gold accent underline */}
          <div className="mx-auto mt-4 h-1 w-20 rounded-full"
               style={{ background: 'linear-gradient(90deg, #c8972a, #f0c060, #c8972a)' }} />
          <p className="mt-5 text-sm tracking-widest uppercase"
             style={{ color: 'var(--rb-text3)' }}>
            Explore our handcrafted selections
          </p>
        </motion.div>

        {/* 4×2 grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;

            return (
              <motion.div
                key={cat.name}
                variants={cardVariants}
                whileHover={{ scale: 1.05, y: -6, boxShadow: '0 20px 40px rgba(200,151,42,0.2)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCardClick(cat.name)}
                className={`
                  relative cursor-pointer rounded-3xl p-6 flex flex-col items-center justify-center gap-3
                  bg-gradient-to-br ${cat.gradient}
                  transition-shadow duration-300
                  ${isActive ? 'ring-2 ring-offset-2 ring-offset-[#111111]' : ''}
                `}
                style={{
                  boxShadow: isActive
                    ? `0 0 0 2px #c8972a, 0 20px 40px -8px ${cat.color}88`
                    : '0 4px 24px -4px rgba(0,0,0,0.6)',
                  ...(isActive ? { outline: 'none' } : {}),
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.boxShadow =
                      `0 20px 40px rgba(200,151,42,0.2), 0 0 0 1px rgba(200,151,42,0.22)`;
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.boxShadow =
                      '0 4px 24px -4px rgba(0,0,0,0.6)';
                  }
                }}
              >
                {/* Active gold border indicator */}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 2px #c8972a' }}
                  />
                )}

                {/* Emoji icon */}
                <span
                  className="text-5xl sm:text-5xl select-none leading-none"
                  role="img"
                  aria-label={cat.name}
                >
                  {cat.emoji}
                </span>

                {/* Category name */}
                <span className="text-white font-bold text-base sm:text-lg tracking-wide text-center leading-tight">
                  {cat.name}
                </span>

                {/* Item count */}
                <span
                  className="text-xs font-medium tracking-widest uppercase"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  {cat.count}
                </span>

                {/* Active gold dot */}
                {isActive && (
                  <span
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#c8972a' }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Menu link */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase
                       transition-all duration-200 hover:gap-3"
            style={{ color: '#f0c060' }}
          >
            View All Menu
            <span className="text-base" aria-hidden="true">→</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
