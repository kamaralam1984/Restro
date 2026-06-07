'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Store, ShoppingCart } from 'lucide-react'
import api from '@/services/api'
import ServiceSuspendedMessage from '@/components/ServiceSuspendedMessage'
import { RestaurantNavbar, HeroSection } from './HeroSection'
import { BrowseMenuSection, HotDealsSection } from './MenuSections'
import { DineWithUsSection, StatsSection, TestimonialsSection, FAQSection } from './DineSections'
import RestaurantChat from './RestaurantChat'

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

// ─── Types ───────────────────────────────────────────────────────────────────

interface Restaurant {
  _id: string
  name: string
  slug: string
  status?: string
  subscriptionStatus?: string
  description?: string
  city?: string
  state?: string
  address?: string
  phone?: string
  primaryColor?: string
  logo?: string
  features?: Record<string, boolean | undefined>
}

interface MenuItem {
  _id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  category?: string
  isAvailable?: boolean
  isVeg?: boolean
  isSignature?: boolean
  badge?: string
  isFeatured?: boolean
}

interface HeroImage {
  imageUrl: string
  order: number
  isActive?: boolean
}

interface Review {
  _id: string
  customerName?: string
  rating: number
  comment?: string
  createdAt?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=75&auto=format&fit=crop'
const BG = '#0a0a0a'

// ─── Global CSS (all keyframes + utility classes needed by all child sections) ─

const GLOBAL_CSS = `
  /* ── Reset / base ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Keyframes ── */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.6; }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px var(--gold, #c8972a)40; }
    50%       { box-shadow: 0 0 60px var(--gold, #c8972a)80, 0 0 100px var(--gold, #c8972a)40; }
  }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  @keyframes countUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  @keyframes float1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33%       { transform: translate(12px, -18px) rotate(5deg); }
    66%       { transform: translate(-8px, 10px) rotate(-3deg); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25%       { transform: translate(-14px, 12px) rotate(-6deg); }
    75%       { transform: translate(10px, -20px) rotate(4deg); }
  }
  @keyframes float3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%       { transform: translate(8px, -14px) scale(1.08); }
  }
  @keyframes float4 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    40%       { transform: translate(-10px, -16px) rotate(-4deg); }
    80%       { transform: translate(14px, 8px) rotate(6deg); }
  }
  @keyframes float5 {
    0%, 100% { transform: translateY(0) scale(1); }
    50%       { transform: translateY(-22px) scale(1.06); }
  }
  @keyframes float6 {
    0%, 100% { transform: translate(0, 0); }
    33%       { transform: translate(16px, -10px); }
    66%       { transform: translate(-12px, 14px); }
  }
  @keyframes float7 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50%       { transform: translate(-16px, -20px) rotate(8deg); }
  }
  @keyframes float8 {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    25%       { transform: translate(10px, 14px) scale(1.05) rotate(-5deg); }
    75%       { transform: translate(-12px, -10px) scale(0.95) rotate(5deg); }
  }

  /* ── Utility classes ── */
  .nav-link {
    color: #a89070;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
    letter-spacing: 0.3px;
  }
  .nav-link:hover { color: var(--gold, #c8972a); }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    padding: 14px 32px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 15px;
    transition: all 0.2s;
    letter-spacing: 0.5px;
    text-decoration: none;
  }
  .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }

  .cta-btn-gold {
    background: linear-gradient(135deg, #8b5a00, var(--gold, #c8972a), #f0c060);
    color: #080808;
  }
  .cta-btn-outline {
    background: transparent;
    color: var(--gold, #c8972a);
    border: 2px solid rgba(200,151,42,0.6);
  }
  .cta-btn-outline:hover {
    background: rgba(200,151,42,0.08);
  }

  .slide-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
    padding: 0;
  }

  .shimmer-text {
    background: linear-gradient(90deg, #a89070, var(--gold, #c8972a), #f0c060, var(--gold, #c8972a), #a89070);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }

  .stat-card {
    animation: countUp 0.6s ease both;
  }

  .marquee-track {
    animation: marquee 28s linear infinite;
  }
  .marquee-track:hover {
    animation-play-state: paused;
  }

  .particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    will-change: transform;
  }
  .particle:nth-child(1)  { animation: float1 6s ease-in-out infinite; }
  .particle:nth-child(2)  { animation: float2 7s ease-in-out infinite 0.8s; }
  .particle:nth-child(3)  { animation: float3 5s ease-in-out infinite 1.2s; }
  .particle:nth-child(4)  { animation: float4 8s ease-in-out infinite 0.4s; }
  .particle:nth-child(5)  { animation: float5 6.5s ease-in-out infinite 1.6s; }
  .particle:nth-child(6)  { animation: float6 7.5s ease-in-out infinite 0.2s; }
  .particle:nth-child(7)  { animation: float7 5.5s ease-in-out infinite 2s; }
  .particle:nth-child(8)  { animation: float8 9s ease-in-out infinite 0.6s; }

  /* ── Newsletter input ── */
  .newsletter-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(200,151,42,0.25);
    border-radius: 4px 0 0 4px;
    color: #f8f4ed;
    font-size: 14px;
    padding: 11px 16px;
    outline: none;
    width: 100%;
    flex: 1;
    transition: border-color 0.2s;
  }
  .newsletter-input::placeholder { color: #6b5a4a; }
  .newsletter-input:focus { border-color: var(--gold, #c8972a); }

  /* ── Menu card hover ── */
  .menu-card { transition: transform 0.2s, box-shadow 0.2s; }
  .menu-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  }

  /* ── Testimonial carousel ── */
  .testimonial-card { transition: transform 0.3s, opacity 0.3s; }

  /* ── Responsive helpers ── */
  @media (max-width: 768px) {
    .hero-grid  { grid-template-columns: 1fr !important; }
    .footer-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
    .menu-grid  { grid-template-columns: 1fr !important; }
  }
`

// ─── Page Component ───────────────────────────────────────────────────────────

export default function RestaurantBySlugPage() {
  const { slug } = useParams<{ slug: string }>()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [heroImages, setHeroImages] = useState<string[]>([DEFAULT_HERO])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 640

  // ── Data fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return

    // Preconnect to image CDNs for faster LCP
    const addPreconnect = (href: string) => {
      if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = href
      document.head.appendChild(link)
    }
    addPreconnect('https://images.unsplash.com')
    addPreconnect('https://res.cloudinary.com')

    // 1. Restaurant info
    api
      .get<Restaurant>(`/restaurants/by-slug/${slug}`)
      .then((data) => {
        setRestaurant(data)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    // 2. Menu items (limit 50, filter unavailable)
    api
      .get<any>('/menu', { params: { restaurant: slug, limit: 50 } })
      .then((data) => {
        const list: MenuItem[] = Array.isArray(data) ? data : (data?.items ?? [])
        setMenuItems(list.filter((i) => i.isAvailable !== false))
      })
      .catch(() => setMenuItems([]))

    // 3. Hero images (sort by order, fallback to DEFAULT_HERO)
    api
      .get<HeroImage[]>('/hero-images', { params: { restaurant: slug } })
      .then((data) => {
        const imgs = Array.isArray(data)
          ? data
              .filter((i) => i.imageUrl)
              .sort((a, b) => a.order - b.order)
              .map((i) => i.imageUrl)
          : []
        setHeroImages(imgs.length > 0 ? imgs : [DEFAULT_HERO])
      })
      .catch(() => setHeroImages([DEFAULT_HERO]))

    // 4. Reviews
    api
      .get<Review[]>('/reviews', { params: { restaurant: slug, limit: 20 } })
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
  }, [slug])

  // ── SEO: Title + Meta Description + Open Graph ───────────────────────────
  useEffect(() => {
    if (!restaurant) return

    // Title
    document.title = `${restaurant.name} - Online Menu, Deals & Table Booking | Restro OS`

    // Helper to upsert a <meta> tag
    const setMeta = (selector: string, attr: string, value: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, value)
        el.setAttribute('data-seo', 'restro')
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    const city = restaurant.city || ''
    const description = `Order online from ${restaurant.name}${city ? ` in ${city}` : ''}. Browse our menu, get exclusive deals, book a table. Fast delivery available.`
    const heroImage = heroImages[0] || DEFAULT_HERO
    const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

    // Standard meta
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[name="keywords"]', 'name', 'keywords', `${restaurant.name}, online food order${city ? `, food delivery ${city}` : ''}, restaurant menu, table booking, deals`)
    setMeta('meta[name="robots"]', 'name', 'robots', 'index, follow')

    // Open Graph
    setMeta('meta[property="og:title"]', 'property', 'og:title', `${restaurant.name} - Online Menu, Deals & Table Booking`)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'restaurant')
    setMeta('meta[property="og:image"]', 'property', 'og:image', heroImage)
    setMeta('meta[property="og:url"]', 'property', 'og:url', pageUrl)
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'en_IN')
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Restro OS')

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', `${restaurant.name} - Online Menu & Deals`)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', heroImage)

    return () => {
      document.title = 'Restro OS'
      document.querySelectorAll('meta[data-seo="restro"]').forEach(el => el.remove())
    }
  }, [restaurant, heroImages])

  // ── SEO: JSON-LD Structured Data ─────────────────────────────────────────
  useEffect(() => {
    if (!restaurant) return

    // Derive unique categories from menu items for cuisine hints
    const categories = Array.from(new Set(menuItems.map(i => i.category).filter(Boolean))) as string[]
    const heroImage = heroImages[0] || DEFAULT_HERO
    const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

    // Remove any previously injected schemas
    document.querySelectorAll('script[data-schema="restaurant"]').forEach(el => el.remove())

    // ── Restaurant / LocalBusiness schema ──
    const restaurantSchema = {
      '@context': 'https://schema.org',
      '@type': ['Restaurant', 'LocalBusiness'],
      name: restaurant.name,
      description: restaurant.description || `${restaurant.name} — great food, great experience.`,
      url: pageUrl,
      image: heroImage,
      telephone: restaurant.phone || undefined,
      priceRange: '₹₹',
      servesCuisine: categories.length > 0 ? categories : ['Indian', 'Fast Food'],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '11:00',
          closes: '23:00',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: restaurant.address || undefined,
        addressLocality: restaurant.city || undefined,
        addressRegion: restaurant.state || undefined,
        addressCountry: 'IN',
      },
      hasMenu: {
        '@type': 'Menu',
        name: `${restaurant.name} — Main Menu`,
        hasMenuSection: categories.slice(0, 6).map(cat => ({
          '@type': 'MenuSection',
          name: cat,
          hasMenuItem: menuItems
            .filter(i => i.category === cat)
            .slice(0, 5)
            .map(i => ({
              '@type': 'MenuItem',
              name: i.name,
              description: i.description || undefined,
              offers: { '@type': 'Offer', price: i.price, priceCurrency: 'INR' },
            })),
        })),
      },
    }

    // ── BreadcrumbList schema ──
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: typeof window !== 'undefined' ? window.location.origin : '' },
        { '@type': 'ListItem', position: 2, name: restaurant.name, item: pageUrl },
      ],
    }

    // ── FAQPage schema ──
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `What are the opening hours of ${restaurant.name}?`,
          acceptedAnswer: { '@type': 'Answer', text: 'We are open Monday to Sunday, 11:00 AM to 11:00 PM.' },
        },
        {
          '@type': 'Question',
          name: `Does ${restaurant.name} offer online ordering?`,
          acceptedAnswer: { '@type': 'Answer', text: `Yes! You can order food online from ${restaurant.name} directly through our website with fast delivery options.` },
        },
        {
          '@type': 'Question',
          name: `Can I book a table at ${restaurant.name}?`,
          acceptedAnswer: { '@type': 'Answer', text: `Yes, ${restaurant.name} accepts online table reservations. Use the booking form on our website to reserve your spot.` },
        },
        {
          '@type': 'Question',
          name: `What type of cuisine does ${restaurant.name} serve?`,
          acceptedAnswer: { '@type': 'Answer', text: `${restaurant.name} serves ${categories.length > 0 ? categories.join(', ') : 'Indian and Fast Food'} cuisine.` },
        },
      ],
    }

    // Inject all three schemas as separate <script> tags
    ;[restaurantSchema, breadcrumbSchema, faqSchema].forEach(schema => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-schema', 'restaurant')
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
    })

    return () => {
      document.querySelectorAll('script[data-schema="restaurant"]').forEach(el => el.remove())
    }
  }, [restaurant, menuItems, heroImages])

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid rgba(200,151,42,0.2)',
            borderTopColor: '#c8972a',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !restaurant) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#a89070', fontSize: 18, marginBottom: 16 }}>
            Restaurant not found
          </p>
          <Link href="/" style={{ color: '#c8972a', fontSize: 14 }}>
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  // ── Suspended ────────────────────────────────────────────────────────────
  const isSuspended =
    restaurant.status === 'inactive' ||
    restaurant.subscriptionStatus === 'suspended' ||
    restaurant.subscriptionStatus === 'cancelled'

  if (isSuspended) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <ServiceSuspendedMessage
          restaurantName={restaurant.name}
          subscriptionExpired={isSuspended}
        />
      </div>
    )
  }

  // ── Computed values ──────────────────────────────────────────────────────
  const gold = restaurant.primaryColor || '#c8972a'
  const features = restaurant.features ?? {}
  const showMenu = features.menuManagement !== false && features.onlineOrdering !== false
  const showBooking = features.tableBooking === true
  const menuUrl = `/menu?restaurant=${slug}`
  const bookingUrl = `/booking?restaurant=${slug}`

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: '#f8f4ed',
        fontFamily: 'inherit',
        '--gold': gold,
      } as React.CSSProperties}
    >
      {/* ═══ 1. Global CSS (all animations + utilities for all child components) ═══ */}
      <style>{GLOBAL_CSS.replace(/var\(--gold, #c8972a\)/g, gold)}</style>

      {/* ═══ 2. Sticky Navbar ═══ */}
      <RestaurantNavbar
        restaurant={restaurant}
        gold={gold}
        showMenu={showMenu}
        showBooking={showBooking}
        menuUrl={menuUrl}
        bookingUrl={bookingUrl}
      />

      {/* ═══ 3. Hero with VFX food carousel + marquee ═══ */}
      <HeroSection
        restaurant={restaurant}
        gold={gold}
        menuItems={menuItems}
        heroImages={heroImages}
        showMenu={showMenu}
        showBooking={showBooking}
        menuUrl={menuUrl}
        bookingUrl={bookingUrl}
      />

      {/* ═══ 4. Browse Menu Section (only if showMenu) ═══ */}
      {showMenu && (
        <BrowseMenuSection
          restaurant={restaurant}
          gold={gold}
          menuItems={menuItems}
          menuUrl={menuUrl}
        />
      )}

      {/* ═══ 5. Hot Deals Section (only if showMenu) ═══ */}
      {showMenu && (
        <HotDealsSection
          restaurant={restaurant}
          gold={gold}
          menuItems={menuItems}
          menuUrl={menuUrl}
        />
      )}

      {/* ═══ 6. Marketing Strip — Why Order Online? ═══ */}
      <div style={{ background: `linear-gradient(135deg, #0a0a0a, #111)`, padding: '32px 16px', borderTop: `1px solid ${gold}18`, borderBottom: `1px solid ${gold}18` }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32 }}>
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: 'Order in 60 seconds' },
            { icon: '🔒', title: 'Secure Payment', desc: '100% safe checkout' },
            { icon: '📍', title: 'Live Tracking', desc: 'Track your order live' },
            { icon: '⭐', title: 'Top Rated', desc: '4.8/5 average rating' },
          ].map(item => (
            <div key={item.title} style={{ textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
              <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 700, margin: '0 0 3px' }}>{item.title}</p>
              <p style={{ color: '#666', fontSize: 12, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 7. Dine With Us + Booking Form ═══ */}
      <DineWithUsSection
        restaurant={restaurant}
        gold={gold}
        showBooking={showBooking}
        bookingUrl={bookingUrl}
      />

      {/* ═══ 8. Animated Stats Counters ═══ */}
      <StatsSection
        restaurant={restaurant}
        gold={gold}
        menuItems={menuItems}
        reviews={reviews}
      />

      {/* ═══ 9. Testimonials Carousel ═══ */}
      <TestimonialsSection reviews={reviews} gold={gold} restaurant={restaurant} />

      {/* ═══ 10. FAQ Section ═══ */}
      <FAQSection restaurant={restaurant} gold={gold} />

      {/* ═══ 11. Premium Footer (inline) ═══ */}
      <footer
        style={{
          background: '#0a0a0a',
          borderTop: `2px solid transparent`,
          backgroundImage: `linear-gradient(#0a0a0a, #0a0a0a), linear-gradient(90deg, transparent, ${gold}, transparent)`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        {/* Gold gradient top line */}
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${gold}80 30%, ${gold} 50%, ${gold}80 70%, transparent 100%)`,
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '40px 16px 0' : '60px 24px 0' }}>
          {/* ── Top: brand + social ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: isMobile ? 24 : 32,
              marginBottom: isMobile ? 32 : 56,
            }}
          >
            {/* Brand */}
            <div style={{ maxWidth: isMobile ? '100%' : 300, width: isMobile ? '100%' : 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                {restaurant.logo ? (
                  <img
                    src={restaurant.logo}
                    alt={restaurant.name}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      objectFit: 'cover',
                      border: `2px solid ${gold}60`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${gold}15`,
                      border: `2px solid ${gold}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Store style={{ width: 24, height: 24, color: gold }} />
                  </div>
                )}
                <div>
                  <p style={{ color: '#f8f4ed', fontWeight: 800, fontSize: 18, letterSpacing: 0.5 }}>
                    {restaurant.name}
                  </p>
                  {restaurant.city && (
                    <p style={{ color: '#6b5a4a', fontSize: 12 }}>
                      {restaurant.city}{restaurant.state ? `, ${restaurant.state}` : ''}
                    </p>
                  )}
                </div>
              </div>
              <p style={{ color: '#6b5a4a', fontSize: 14, lineHeight: 1.7 }}>
                {restaurant.description ||
                  'Experience the finest culinary craftsmanship, where every dish tells a story of passion and flavor.'}
              </p>

              {/* Social icons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                {/* Instagram */}
                <a
                  href="#"
                  aria-label="Instagram"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${gold}12`,
                    border: `1px solid ${gold}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: gold,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.8" fill={gold} stroke="none"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href="#"
                  aria-label="Facebook"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${gold}12`,
                    border: `1px solid ${gold}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: gold,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={gold}>
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                {/* Twitter / X */}
                <a
                  href="#"
                  aria-label="Twitter"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${gold}12`,
                    border: `1px solid ${gold}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: gold,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={gold}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* ── Middle grid: Quick Links | Contact | Newsletter ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '160px 220px 280px',
                gap: isMobile ? 28 : 40,
                flex: 1,
                minWidth: 0,
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'start' : 'end',
              }}
            >
              {/* Quick Links */}
              <div>
                <h4
                  style={{
                    color: gold,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 20,
                  }}
                >
                  Quick Links
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Home', href: `/r/${slug}` },
                    ...(showMenu ? [{ label: 'Menu', href: menuUrl }] : []),
                    ...(showBooking ? [{ label: 'Book Table', href: bookingUrl }] : []),
                    { label: 'Contact', href: restaurant.phone ? `tel:${restaurant.phone}` : '#' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        style={{
                          color: '#6b5a4a',
                          fontSize: 14,
                          textDecoration: 'none',
                          transition: 'color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        className="nav-link"
                      >
                        <span style={{ color: gold, fontSize: 10 }}>✦</span> {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4
                  style={{
                    color: gold,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 20,
                  }}
                >
                  Contact
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {restaurant.phone && (
                    <a
                      href={`tel:${restaurant.phone}`}
                      style={{ color: '#6b5a4a', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: 8 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.16 6.16l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      {restaurant.phone}
                    </a>
                  )}
                  {(restaurant.address || restaurant.city) && (
                    <span style={{ color: '#6b5a4a', fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>
                        {restaurant.address && <>{restaurant.address}<br /></>}
                        {restaurant.city}{restaurant.state ? `, ${restaurant.state}` : ''}
                      </span>
                    </span>
                  )}
                  <span style={{ color: '#6b5a4a', fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    contact@{restaurant.slug}.com
                  </span>
                  <span style={{ color: '#6b5a4a', fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Mon–Sun: 11:00 AM – 11:00 PM
                  </span>
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <h4
                  style={{
                    color: gold,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  Newsletter
                </h4>
                <p style={{ color: '#6b5a4a', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                  Stay updated! Get exclusive deals and new menu alerts.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setNewsletterEmail('')
                  }}
                  style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0 }}
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your email address"
                    className="newsletter-input"
                    style={isMobile ? { borderRadius: 4 } : undefined}
                    required
                  />
                  <button
                    type="submit"
                    style={{
                      background: gold,
                      color: '#080808',
                      border: 'none',
                      borderRadius: isMobile ? 4 : '0 4px 4px 0',
                      padding: isMobile ? '12px 18px' : '0 18px',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      letterSpacing: 0.5,
                      transition: 'opacity 0.2s',
                      width: isMobile ? '100%' : 'auto',
                    }}
                  >
                    Subscribe
                  </button>
                </form>
                <p style={{ color: '#4a3a2a', fontSize: 11, marginTop: 10 }}>
                  No spam. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div
            style={{
              borderTop: `1px solid rgba(200,151,42,0.12)`,
              padding: '20px 0 28px',
              display: 'flex',
              alignItems: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: isMobile ? 'center' : 'space-between',
              textAlign: isMobile ? 'center' : 'left',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <p style={{ color: '#4a3a2a', fontSize: 13 }}>
              © 2026 {restaurant.name}. All rights reserved.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/privacy" style={{ color: '#4a3a2a', fontSize: 12, textDecoration: 'none' }}>Privacy</Link>
              <span style={{ color: '#4a3a2a' }}>·</span>
              <Link href="/terms" style={{ color: '#4a3a2a', fontSize: 12, textDecoration: 'none' }}>Terms</Link>
              <span style={{ color: '#4a3a2a' }}>·</span>
              <Link
                href="/"
                style={{ color: '#4a3a2a', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
              >
                Powered by{' '}
                <span style={{ color: gold, fontWeight: 700 }}>Restro OS</span>
                {' '}✦
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <RestaurantChat
        restaurantId={restaurant._id}
        restaurantName={restaurant.name}
        restaurantSlug={restaurant.slug}
        gold={gold}
        phone={restaurant.phone}
      />

      {/* ═══ Hidden SEO text (screen-reader + crawler accessible) ═══ */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}
      >
        <h1>{restaurant.name} - Restaurant{restaurant.city ? ` in ${restaurant.city}` : ''}</h1>
        <p>
          Order food online from {restaurant.name}.
          {Array.from(new Set(menuItems.map(i => i.category).filter(Boolean))).length > 0
            ? ` Best ${Array.from(new Set(menuItems.map(i => i.category).filter(Boolean))).join(', ')}${restaurant.city ? ` in ${restaurant.city}` : ''}.`
            : null}
          {restaurant.description ? ` ${restaurant.description}` : null}
        </p>
        <p>
          Fast delivery. Table booking available. Exclusive deals and offers.
          {restaurant.phone ? ` Call us at ${restaurant.phone}.` : null}
          {restaurant.address ? ` Located at ${restaurant.address}${restaurant.city ? `, ${restaurant.city}` : ''}.` : null}
        </p>
        <ul>
          {menuItems.slice(0, 20).map(item => (
            <li key={item._id}>
              {item.name}{item.description ? ` — ${item.description}` : ''} — ₹{item.price}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
