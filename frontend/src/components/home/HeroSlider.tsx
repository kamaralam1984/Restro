'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideData {
  bgColor: string;
  accentColor: string;
  badge: string;
  headline: string;
  sub: string;
  price: string;
  originalPrice: string;
  cta: string;
  image: string;
}

const slides: SlideData[] = [
  {
    bgColor: 'linear-gradient(135deg, #080808 0%, #1a1000 100%)',
    accentColor: '#c8972a',
    badge: '⭐ SIGNATURE DISH',
    headline: 'DOUBLE SMASH BURGER',
    sub: 'Juicy double patty with crispy lettuce, tomato & our secret sauce',
    price: '₹199',
    originalPrice: '₹349',
    cta: 'ORDER NOW',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&q=90&fit=crop',
  },
  {
    bgColor: 'linear-gradient(135deg, #080808 0%, #0f1200 100%)',
    accentColor: '#f0c060',
    badge: '👑 CHEF\'S SPECIAL',
    headline: 'LOADED PEPPERONI PIZZA',
    sub: '8-inch deep dish with extra cheese, fresh herbs & premium toppings',
    price: '₹299',
    originalPrice: '₹499',
    cta: 'ORDER NOW',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&q=90&fit=crop',
  },
  {
    bgColor: 'linear-gradient(135deg, #080808 0%, #120800 100%)',
    accentColor: '#e8d5a0',
    badge: '🏆 BESTSELLER',
    headline: 'CRISPY FRIED CHICKEN',
    sub: '11 herbs & spices recipe, perfectly golden outside, tender inside',
    price: '₹249',
    originalPrice: '₹399',
    cta: 'ORDER NOW',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=700&q=90&fit=crop',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const prev = () => {
    const newIndex = (current - 1 + slides.length) % slides.length;
    setDirection(-1);
    setCurrent(newIndex);
  };

  const next = () => {
    const newIndex = (current + 1) % slides.length;
    setDirection(1);
    setCurrent(newIndex);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setDirection(1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '560px',
        overflow: 'hidden',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Mobile responsive styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hero-food-image-col {
          display: flex;
        }
        @media (max-width: 767px) {
          .hero-food-image-col {
            display: none !important;
          }
          .hero-text-col {
            flex: 0 0 100% !important;
            max-width: 100% !important;
            align-items: center !important;
            text-align: center !important;
          }
          .hero-badge {
            align-self: center !important;
          }
          .hero-cta-btn {
            align-self: center !important;
          }
          .hero-pricing {
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Slides */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
            transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              background: slide.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 5vw',
            }}
          >
            {/* Decorative radial glow behind image */}
            <div
              style={{
                position: 'absolute',
                right: '10%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '42vw',
                height: '42vw',
                maxWidth: '560px',
                maxHeight: '560px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${slide.accentColor}44 0%, transparent 70%)`,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Left: Text Content — key forces re-mount so inline animations re-fire */}
            <div
              key={current}
              className="hero-text-col"
              style={{
                flex: '0 0 50%',
                maxWidth: '560px',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.45 }}
                className="hero-badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: `${slide.accentColor}22`,
                  border: `1.5px solid ${slide.accentColor}`,
                  borderRadius: '100px',
                  padding: '6px 18px',
                  color: '#f0c060',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  alignSelf: 'flex-start',
                }}
              >
                {slide.badge}
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.27, duration: 0.45 }}
                style={{
                  margin: 0,
                  fontSize: 'clamp(28px, 4.5vw, 64px)',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.05,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  textShadow: `0 0 40px ${slide.accentColor}66`,
                }}
              >
                {slide.headline}
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.39, duration: 0.45 }}
                style={{
                  margin: 0,
                  fontSize: 'clamp(13px, 1.5vw, 17px)',
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.6,
                  maxWidth: '400px',
                }}
              >
                {slide.sub}
              </motion.p>

              {/* Pricing */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.51, duration: 0.45 }}
                className="hero-pricing"
                style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}
              >
                <span
                  style={{
                    fontSize: 'clamp(36px, 5vw, 72px)',
                    fontWeight: 900,
                    color: '#f0c060',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  {slide.price}
                </span>
                <span
                  style={{
                    fontSize: 'clamp(18px, 2vw, 28px)',
                    fontWeight: 500,
                    color: '#666',
                    textDecoration: 'line-through',
                  }}
                >
                  {slide.originalPrice}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#080808',
                    background: slide.accentColor,
                    borderRadius: '6px',
                    padding: '4px 10px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {Math.round(
                    (1 -
                      parseInt(slide.price.replace('₹', '')) /
                        parseInt(slide.originalPrice.replace('₹', ''))) *
                      100
                  )}
                  % OFF
                </span>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.63, duration: 0.45 }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(240,192,96,0.6)' }}
                whileTap={{ scale: 0.97 }}
                className="hero-cta-btn"
                style={{
                  alignSelf: 'flex-start',
                  padding: '15px 40px',
                  background: '#c8972a',
                  color: '#080808',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 6px 24px rgba(200,151,42,0.5)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {slide.cta} &rarr;
              </motion.button>
            </div>

            {/* Right: Food Image */}
            <div
              className="hero-food-image-col"
              style={{
                flex: '0 0 50%',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2,
                position: 'relative',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut', delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                style={{
                  position: 'relative',
                  width: 'clamp(260px, 38vw, 540px)',
                  height: 'clamp(260px, 38vw, 540px)',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `3px solid ${slide.accentColor}44`,
                  boxShadow: `0 0 80px ${slide.accentColor}44, 0 30px 60px rgba(0,0,0,0.6)`,
                }}
              >
                <Image
                  src={slide.image}
                  alt={slide.headline}
                  fill
                  unoptimized
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </motion.div>

              {/* Floating price tag on image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: -10 }}
                transition={{ delay: 0.55, duration: 0.45, type: 'spring', stiffness: 200 }}
                style={{
                  position: 'absolute',
                  bottom: '8%',
                  left: '8%',
                  background: 'linear-gradient(135deg, #c8972a, #f0c060)',
                  color: '#080808',
                  borderRadius: '50%',
                  width: '76px',
                  height: '76px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 20px rgba(200,151,42,0.6)',
                  lineHeight: 1.1,
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '18px' }}>{slide.price}</span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>ONLY</span>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Left Arrow */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'rgba(255,255,255,0.07)',
            border: '1.5px solid rgba(200,151,42,0.4)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(200,151,42,0.25)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8972a';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(255,255,255,0.07)';
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(200,151,42,0.4)';
          }}
        >
          <ChevronLeft size={22} />
        </button>

        {/* Right Arrow */}
        <button
          onClick={next}
          aria-label="Next slide"
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'rgba(255,255,255,0.07)',
            border: '1.5px solid rgba(200,151,42,0.4)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(200,151,42,0.25)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8972a';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(255,255,255,0.07)';
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(200,151,42,0.4)';
          }}
        >
          <ChevronRight size={22} />
        </button>

        {/* Navigation Dots */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === current ? '32px' : '10px',
                height: '10px',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
                background:
                  i === current ? '#c8972a' : 'rgba(200,151,42,0.3)',
                transition: 'all 0.35s cubic-bezier(0.77,0,0.175,1)',
                padding: 0,
                boxShadow:
                  i === current ? `0 0 10px #f0c060` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Ticker Strip */}
      <div
        style={{
          width: '100%',
          background: 'linear-gradient(90deg, #c8972a, #f0c060, #c8972a)',
          overflow: 'hidden',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          borderTop: '1px solid rgba(200,151,42,0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            animation: 'marquee 18s linear infinite',
            willChange: 'transform',
          }}
        >
          {[0, 1].map((repeat) => (
            <span
              key={repeat}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0',
                color: '#080808',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                paddingRight: '60px',
              }}
            >
              <span style={{ marginRight: '14px' }}>🚴 Free Delivery</span>
              <span style={{ color: '#f0c060', marginRight: '14px' }}>·</span>
              <span style={{ marginRight: '14px' }}>30 Min Guarantee</span>
              <span style={{ color: '#f0c060', marginRight: '14px' }}>·</span>
              <span style={{ marginRight: '14px' }}>100% Fresh</span>
              <span style={{ color: '#f0c060', marginRight: '14px' }}>·</span>
              <span style={{ marginRight: '14px' }}>Zomato &amp; Swiggy Partner</span>
              <span style={{ color: '#f0c060', marginRight: '14px' }}>·</span>
              <span style={{ marginRight: '14px' }}>No Hidden Charges</span>
              <span style={{ color: '#f0c060', marginRight: '14px' }}>·</span>
              <span style={{ marginRight: '14px' }}>Premium Quality Ingredients</span>
              <span style={{ color: '#f0c060', marginRight: '14px' }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
