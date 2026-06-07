'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';

const deals = [
  {
    badge: 'FLAT ₹149',
    title: 'Burger Combo Meal',
    desc: '1 Smash Burger + Fries + Coke',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=85&fit=crop',
    originalPrice: '₹299',
    validTill: 'Ends Tonight',
    tag: 'BESTSELLER',
    tagColor: '#f0c060',
  },
  {
    badge: 'FLAT ₹199',
    title: 'Pizza Party Pack',
    desc: '1 Large Pizza (8 slices) + 2 Pepsi',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=85&fit=crop',
    originalPrice: '₹499',
    validTill: 'Weekend Special',
    tag: 'FAMILY DEAL',
    tagColor: '#4caf50',
  },
  {
    badge: 'BUY 1 GET 1',
    title: 'Crispy Chicken Wings',
    desc: '6 Wings with your choice of dip',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=85&fit=crop',
    originalPrice: '₹249',
    validTill: 'Mon–Fri Only',
    tag: 'HOT DEAL',
    tagColor: '#c8972a',
  },
  {
    badge: 'FREE DESSERT',
    title: 'Biryani + Raita Combo',
    desc: 'Full plate Chicken Biryani with Raita & Papad',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=85&fit=crop',
    originalPrice: '₹349',
    validTill: 'Lunch Special',
    tag: 'NEW',
    tagColor: '#00bcd4',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 44 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function DealsSection() {
  return (
    <section
      style={{ background: 'var(--rb-bg)' }}
      className="relative w-full py-20 px-4 overflow-hidden deals-section"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '72%',
          height: '360px',
          background:
            'radial-gradient(ellipse at center, rgba(200,151,42,0.1) 0%, transparent 68%)',
          pointerEvents: 'none',
          filter: 'blur(48px)',
        }}
      />

      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
        {/* ── Section header ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '56px',
            gap: '16px',
          }}
        >
          {/* Limited-time pill badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.82 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              background: 'rgba(200,151,42,0.12)',
              border: '1.5px solid rgba(200,151,42,0.35)',
              color: '#f0c060',
              borderRadius: '9999px',
              padding: '6px 20px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
            }}
          >
            🔥 LIMITED TIME
          </motion.span>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.52, delay: 0.1 }}
            style={{
              margin: 0,
              fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--rb-text)',
              textTransform: 'uppercase',
            }}
          >
            TODAY&apos;S{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5a00 0%, #c8972a 55%, #f0c060 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              HOT
            </span>{' '}
            DEALS
          </motion.h2>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.2 }}
            style={{
              margin: 0,
              color: 'var(--rb-text2)',
              fontSize: '15px',
              maxWidth: '400px',
              lineHeight: 1.65,
            }}
          >
            Unbeatable prices, unmatched flavour. Grab your deal before it&apos;s gone.
          </motion.p>
        </div>

        {/* ── Deal cards ── */}
        <motion.div
          className="deals-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '22px',
          }}
        >
          {deals.map((deal, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{
                y: -8,
                boxShadow: '0 24px 48px rgba(200,151,42,0.3)',
              }}
              style={{
                background: 'var(--rb-surface)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--rb-border)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
            >
              {/* ── Food image (16:9) ── */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  unoptimized
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 90vw, 45vw"
                />

                {/* Gradient scrim */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.48) 100%)',
                  }}
                />

                {/* Price badge — top-left blue pill */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#c8972a',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 16px rgba(200,151,42,0.5)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {deal.badge}
                </div>

                {/* Deal tag — top-right */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: deal.tagColor,
                    color: '#080808',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '9px',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    boxShadow: `0 2px 8px ${deal.tagColor}55`,
                  }}
                >
                  {deal.tag}
                </div>
              </div>

              {/* ── Card body ── */}
              <div
                style={{
                  padding: '18px 20px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                }}
              >
                {/* Deal name */}
                <h3
                  style={{
                    margin: 0,
                    color: 'var(--rb-text)',
                    fontSize: '17px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {deal.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    margin: 0,
                    color: 'var(--rb-text2)',
                    fontSize: '13px',
                    lineHeight: 1.55,
                  }}
                >
                  {deal.desc}
                </p>

                {/* Pricing row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      color: 'var(--rb-text3)',
                      fontSize: '13px',
                      textDecoration: 'line-through',
                    }}
                  >
                    {deal.originalPrice}
                  </span>
                  <span
                    style={{
                      background: 'rgba(200,151,42,0.18)',
                      color: '#f0c060',
                      borderRadius: '5px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    SAVE BIG
                  </span>
                </div>

                {/* Validity timer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: 'var(--rb-text3)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  <Clock size={12} strokeWidth={2} />
                  <span>{deal.validTill}</span>
                </div>

                {/* CTA button */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(240,192,96,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: '4px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #c8972a, #f0c060)',
                    color: '#080808',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(200,151,42,0.4)',
                  }}
                >
                  Order This Deal
                  <ArrowRight size={15} strokeWidth={2.5} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
