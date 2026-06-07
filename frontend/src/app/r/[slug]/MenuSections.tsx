'use client'

import { motion } from 'framer-motion'
import { UtensilsCrossed, Flame, Tag, ArrowRight, ShoppingCart, Star, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getFoodImage, CATEGORY_IMAGES } from './HeroSection'

// ─── Responsive hook ─────────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}

// Shared TypeScript interfaces used across all sections
interface Restaurant {
  _id: string; name: string; slug: string;
  status?: string; subscriptionStatus?: string;
  description?: string; city?: string; state?: string;
  address?: string; phone?: string; email?: string;
  primaryColor?: string; logo?: string;
  openingTime?: string; closingTime?: string;
  features?: Record<string, boolean | undefined>;
}
interface MenuItem {
  _id: string; name: string; description?: string;
  price: number; originalPrice?: number;
  image?: string; category?: string;
  isAvailable?: boolean; isVeg?: boolean;
  isSignature?: boolean; badge?: string; isFeatured?: boolean;
}
interface Review {
  _id: string; customerName?: string; rating: number;
  comment?: string; createdAt?: string;
}

// ─── Emoji map for categories ───────────────────────────────────────────────
function getCategoryEmoji(category: string): string {
  const lower = category.toLowerCase()
  if (lower.includes('burger')) return '🍔'
  if (lower.includes('pizza')) return '🍕'
  if (lower.includes('biryani')) return '🍛'
  if (lower.includes('chinese')) return '🥡'
  if (lower.includes('chicken')) return '🍗'
  if (lower.includes('salad')) return '🥗'
  if (lower.includes('drink') || lower.includes('beverage')) return '🥤'
  if (lower.includes('dessert')) return '🍰'
  if (lower.includes('starter') || lower.includes('appetizer')) return '🥙'
  if (lower.includes('south indian')) return '🥘'
  if (lower.includes('north indian')) return '🫕'
  if (lower.includes('seafood')) return '🦐'
  return '🍽️'
}

// ─── Placeholder categories when no items ───────────────────────────────────
const PLACEHOLDER_CATEGORIES = [
  { name: 'Burgers', emoji: '🍔', count: 12 },
  { name: 'Pizza', emoji: '🍕', count: 8 },
  { name: 'Biryani', emoji: '🍛', count: 6 },
  { name: 'Chinese', emoji: '🥡', count: 10 },
  { name: 'Chicken', emoji: '🍗', count: 9 },
  { name: 'Starters', emoji: '🥙', count: 7 },
  { name: 'Desserts', emoji: '🍰', count: 5 },
  { name: 'Drinks', emoji: '🥤', count: 11 },
]

// ─── Placeholder deals when no discounted items ──────────────────────────────
const PLACEHOLDER_DEALS = [
  {
    _id: 'placeholder-1',
    name: 'Double Smash Burger Combo',
    description: 'Two juicy smash patties, crispy fries & a refreshing cold drink',
    price: 299,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    category: 'Burgers',
  },
  {
    _id: 'placeholder-2',
    name: 'Margherita Pizza Large',
    description: 'Fresh mozzarella, basil, and our signature tomato sauce on hand-tossed dough',
    price: 349,
    originalPrice: 599,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    category: 'Pizza',
  },
  {
    _id: 'placeholder-3',
    name: 'Special Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken, saffron and secret spices',
    price: 249,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96e?w=800&q=80',
    category: 'Biryani',
  },
  {
    _id: 'placeholder-4',
    name: 'Crispy Fried Chicken',
    description: 'Golden fried chicken with spicy seasoning and tangy dipping sauce',
    price: 199,
    originalPrice: 349,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=800&q=80',
    category: 'Chicken',
  },
]

// ─── Countdown Timer ─────────────────────────────────────────────────────────
function CountdownTimer({ gold }: { gold: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: '23', m: '59', s: '59' })

  useEffect(() => {
    const getSecondsUntilMidnight = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      return Math.floor((midnight.getTime() - now.getTime()) / 1000)
    }

    let remaining = getSecondsUntilMidnight()

    const tick = () => {
      if (remaining <= 0) {
        remaining = 86399
      }
      const h = Math.floor(remaining / 3600)
      const m = Math.floor((remaining % 3600) / 60)
      const s = remaining % 60
      setTimeLeft({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      })
      remaining--
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 20px', borderRadius: 100,
        fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
        background: gold, color: '#000',
        flexWrap: 'wrap', justifyContent: 'center', maxWidth: '100%',
      }}
    >
      <span>⏰</span>
      <span style={{ whiteSpace: 'nowrap' }}>Offer ends in:</span>
      <span style={{ fontFamily: 'monospace', fontSize: 15, whiteSpace: 'nowrap' }}>
        {timeLeft.h}:{timeLeft.m}:{timeLeft.s}
      </span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT 1: BrowseMenuSection
// ══════════════════════════════════════════════════════════════════════════════
export function BrowseMenuSection({
  restaurant,
  menuItems,
  gold,
  menuUrl,
}: {
  restaurant: Restaurant
  menuItems: MenuItem[]
  gold: string
  menuUrl: string
}) {
  const width = useWindowWidth()
  const isMobile = width < 640
  const isTablet = width < 1024

  // Build category map
  const categoryMap: Record<string, number> = {}
  menuItems.forEach((item) => {
    const cat = item.category?.trim() || 'Others'
    categoryMap[cat] = (categoryMap[cat] || 0) + 1
  })

  const categories = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    emoji: getCategoryEmoji(name),
    count,
  }))

  const displayCategories = categories.length > 0 ? categories : PLACEHOLDER_CATEGORIES

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
    }),
  }

  const sectionPadding = isMobile ? '48px 16px' : '80px 16px'
  const categoryGridCols = isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)'

  return (
    <section style={{ background: '#0d0d0d', padding: sectionPadding }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 56 }}>
          <p style={{ color: gold, fontSize: 11, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: 12 }}>
            Explore Our Handcrafted Selections
          </p>
          <h2 style={{ color: '#f8f4ed', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>
            Browse Menu
          </h2>
          <div style={{ height: 3, width: 80, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: '16px auto 0', borderRadius: 4 }} />
        </div>

        {/* Categories Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: categoryGridCols, gap: isMobile ? 12 : 16, marginBottom: 48 }}>
          {displayCategories.map((cat, i) => (
            <Link key={cat.name} href={`${menuUrl}?category=${encodeURIComponent(cat.name)}`} style={{ textDecoration: 'none' }}>
              <motion.div
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={cardVariants}
                whileHover={{ scale: 1.04, boxShadow: `0 0 24px ${gold}55` }}
                whileTap={{ scale: 0.97 }}
                style={{ cursor: 'pointer', borderRadius: 16, overflow: 'hidden', background: '#1a1a1a', border: `1px solid ${gold}33` }}
              >
                {/* Real food image top half */}
                <div style={{ width: '100%', height: 110, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={getFoodImage(cat.name, cat.name, i)}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />
                  <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '1.5rem' }}>{cat.emoji}</div>
                </div>
                {/* Text bottom */}
                <div style={{ padding: '12px 8px 14px', textAlign: 'center', background: '#1a1a1a' }}>
                  <p style={{ color: '#f8f4ed', fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{cat.name}</p>
                  <p style={{ color: gold, fontSize: 11, fontWeight: 600, letterSpacing: 2, marginTop: 4 }}>{cat.count} ITEMS</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* View All button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link href={menuUrl}>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: gold, color: '#000' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 32px', borderRadius: 100,
                border: `2px solid ${gold}`, color: gold,
                background: 'transparent', fontWeight: 700,
                fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              View All Menu
              <ArrowRight size={16} />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT 2: HotDealsSection
// ══════════════════════════════════════════════════════════════════════════════
export function HotDealsSection({
  restaurant,
  menuItems,
  gold,
  menuUrl,
}: {
  restaurant: Restaurant
  menuItems: MenuItem[]
  gold: string
  menuUrl: string
}) {
  const width = useWindowWidth()
  const isMobile = width < 640
  const isTablet = width < 1024

  // Find discounted items
  const dealItems = menuItems
    .filter(
      (item) =>
        item.originalPrice !== undefined &&
        item.originalPrice !== null &&
        item.originalPrice > item.price
    )
    .slice(0, 4)

  const displayDeals = dealItems.length > 0 ? dealItems : PLACEHOLDER_DEALS

  const discountPct = (item: (typeof displayDeals)[0]) => {
    if (!item.originalPrice) return 0
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
  }

  // Placeholder gradient backgrounds for cards without images
  const gradients = [
    'linear-gradient(135deg, #1a0a00, #3d1a00)',
    'linear-gradient(135deg, #0a001a, #1a003d)',
    'linear-gradient(135deg, #001a0a, #003d1a)',
    'linear-gradient(135deg, #1a1a00, #3d3d00)',
  ]

  const dealGridCols = isMobile
    ? '1fr'
    : displayDeals.length <= 2
    ? 'repeat(2, 1fr)'
    : isTablet
    ? 'repeat(2, 1fr)'
    : 'repeat(4, 1fr)'

  return (
    <section style={{ background: '#111', padding: isMobile ? '48px 16px' : '80px 16px' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        {/* Countdown at top */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, overflow: 'hidden' }}>
          <CountdownTimer gold={gold} />
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 56 }}>
          {/* Animated badge */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 100,
              fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', marginBottom: 16,
              background: `${gold}22`, border: `1px solid ${gold}`, color: gold,
            }}
          >
            <Flame size={13} />
            LIMITED TIME
          </motion.div>

          <h2 style={{ color: '#f8f4ed', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>
            Today&apos;s Hot Deals
          </h2>
          <div style={{ height: 3, width: 80, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: '16px auto 0', borderRadius: 4 }} />
          <p style={{ color: gold, fontSize: 13, fontWeight: 600, letterSpacing: 2, marginTop: 10 }}>Hurry up! Offer ends soon.</p>
        </div>

        {/* Deal Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: dealGridCols, gap: isMobile ? 16 : 20 }}>
          {displayDeals.map((item, i) => {
            const pct = discountPct(item)
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.1, duration: 0.55, ease: 'easeOut' }}
                whileHover={{ y: -8 }}
                style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', minHeight: 300, border: `1px solid ${gold}33` }}
              >
                {/* Food image — full background */}
                <img
                  src={(item as MenuItem).image || getFoodImage(item.category, item.name, i)}
                  alt={item.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = getFoodImage(item.category, item.name, i) }}
                />
                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.1) 100%)' }} />

                {/* Discount badge */}
                {pct > 0 && (
                  <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, padding: '4px 12px', borderRadius: 100, background: 'linear-gradient(135deg, #ff4500, #ff6a00)', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>
                    SAVE {pct}%
                  </div>
                )}

                {/* Content bottom */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 20, zIndex: 10 }}>
                  <h3 style={{ color: '#ffffff', fontSize: 18, fontWeight: 900, lineHeight: 1.2, margin: '0 0 6px' }}>{item.name}</h3>
                  {item.description && (
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 1.5, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
                    {item.originalPrice && (
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'line-through', fontWeight: 600 }}>₹{item.originalPrice}</span>
                    )}
                    <span style={{ color: gold, fontSize: 24, fontWeight: 900 }}>₹{item.price}</span>
                  </div>
                  <Link href={menuUrl}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, background: gold, color: '#000', fontWeight: 900, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}
                    >
                      <ShoppingCart size={15} /> Order Now
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* View all deals link */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <Link href={menuUrl}>
            <motion.span
              whileHover={{ x: 4 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: gold, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer' }}
            >
              <Tag size={14} /> See All Offers <ArrowRight size={14} />
            </motion.span>
          </Link>
        </div>
      </div>
    </section>
  )
}
