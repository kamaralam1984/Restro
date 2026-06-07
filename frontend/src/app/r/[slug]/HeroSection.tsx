'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, Star, Calendar, UtensilsCrossed, Phone, MapPin, ChevronLeft, ChevronRight, Flame, Clock, Award, Wifi } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// ── Mobile detection hook ────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}

// ── Real food image map by category ─────────────────────────────────────────
export const CATEGORY_IMAGES: Record<string, string> = {
  burger:       'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=75&auto=format&fit=crop',
  burgers:      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=75&auto=format&fit=crop',
  pizza:        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=75&auto=format&fit=crop',
  pizzas:       'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=75&auto=format&fit=crop',
  biryani:      'https://images.unsplash.com/photo-1563379091339-03246963d96e?w=600&q=75&auto=format&fit=crop',
  chicken:      'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=600&q=75&auto=format&fit=crop',
  chinese:      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=75&auto=format&fit=crop',
  salad:        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=75&auto=format&fit=crop',
  salads:       'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=75&auto=format&fit=crop',
  drinks:       'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=75&auto=format&fit=crop',
  beverages:    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=75&auto=format&fit=crop',
  dessert:      'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=75&auto=format&fit=crop',
  desserts:     'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=75&auto=format&fit=crop',
  starters:     'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&q=75&auto=format&fit=crop',
  appetizers:   'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&q=75&auto=format&fit=crop',
  'south indian':'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=75&auto=format&fit=crop',
  'north indian':'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=75&auto=format&fit=crop',
  indian:       'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=75&auto=format&fit=crop',
  seafood:      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=75&auto=format&fit=crop',
  pasta:        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=75&auto=format&fit=crop',
  sandwich:     'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=75&auto=format&fit=crop',
  sandwiches:   'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=75&auto=format&fit=crop',
  paneer:       'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=75&auto=format&fit=crop',
  rice:         'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=75&auto=format&fit=crop',
  curry:        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=75&auto=format&fit=crop',
  noodles:      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=75&auto=format&fit=crop',
  wrap:         'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=75&auto=format&fit=crop',
  wraps:        'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=75&auto=format&fit=crop',
}

export const DEFAULT_FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=75&auto=format&fit=crop',
]

export function getFoodImage(category?: string, name?: string, index = 0): string {
  const key = (category || name || '').toLowerCase().trim()
  if (CATEGORY_IMAGES[key]) return CATEGORY_IMAGES[key]
  // partial match
  for (const [k, url] of Object.entries(CATEGORY_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return url
  }
  return DEFAULT_FOOD_IMAGES[index % DEFAULT_FOOD_IMAGES.length]
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

// ━━━ COMPONENT 1: RestaurantNavbar ━━━
interface RestaurantNavbarProps {
  restaurant: Restaurant;
  gold: string;
  menuUrl: string;
  bookingUrl: string;
  showBooking: boolean;
  showMenu: boolean;
  cartCount?: number;
}

export function RestaurantNavbar({
  restaurant,
  gold,
  menuUrl,
  bookingUrl,
  showBooking,
  showMenu,
  cartCount = 0,
}: RestaurantNavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth <= 768

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false)
  }, [isMobile])

  const navLinks = [
    { label: 'Home', href: `#hero` },
    ...(showMenu ? [{ label: 'Menu', href: menuUrl }] : []),
    { label: 'Deals', href: `#deals` },
    ...(showBooking ? [{ label: 'Book Table', href: bookingUrl }] : []),
    { label: 'Contact', href: `#contact` },
  ]

  return (
    <>
      <style>{`
        .navbar-gold-border {
          border-bottom: 1px solid rgba(200, 151, 42, 0.3);
        }
        .nav-link-hover {
          position: relative;
        }
        .nav-link-hover::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: ${gold};
          transition: width 0.3s ease;
        }
        .nav-link-hover:hover::after {
          width: 100%;
        }
        .cart-badge-pulse {
          animation: cartPulse 2s ease-in-out infinite;
        }
        @keyframes cartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .mobile-menu-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 48;
        }
        .mobile-menu-drawer {
          position: fixed;
          top: 0; right: 0;
          width: 260px;
          height: 100vh;
          background: #0f0f0f;
          border-left: 1px solid rgba(200,151,42,0.25);
          z-index: 49;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          gap: 4px;
          transform: translateX(0);
          transition: transform 0.28s ease;
        }
        .hamburger-btn {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 38px; height: 38px;
          background: rgba(200,151,42,0.1);
          border: 1px solid rgba(200,151,42,0.3);
          border-radius: 8px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .hamburger-btn span {
          display: block;
          width: 18px; height: 2px;
          background: ${gold};
          border-radius: 2px;
          transition: all 0.25s ease;
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .nav-cart-text { display: none !important; }
          .navbar-restaurant-name {
            font-size: 14px !important;
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        @media (max-width: 390px) {
          .navbar-restaurant-name {
            max-width: 110px;
          }
        }
      `}</style>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          {/* Drawer header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: `1px solid rgba(200,151,42,0.2)`,
            marginBottom: '0.5rem',
          }}>
            <span style={{ color: gold, fontWeight: 700, fontSize: '14px', letterSpacing: '0.06em' }}>
              MENU
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '2px 6px',
              }}
            >
              ×
            </button>
          </div>

          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '15px',
                fontWeight: 500,
                padding: '12px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'block',
                letterSpacing: '0.03em',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.1)'
                ;(e.currentTarget as HTMLElement).style.color = gold
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'
              }}
            >
              {item.label}
            </Link>
          ))}

          {/* Phone in drawer */}
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: `linear-gradient(135deg, ${gold}, #a8751a)`,
                color: '#000',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                marginTop: 'auto',
                justifyContent: 'center',
              }}
            >
              <Phone size={16} />
              Call Now
            </a>
          )}
        </div>
      )}

      <nav
        className="navbar-gold-border"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: scrolled ? 'rgba(8,8,8,0.97)' : '#080808',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

            {/* Left: Logo + Name + City */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, minWidth: 0 }}>
              {/* Logo Circle */}
              <div style={{
                width: isMobile ? '36px' : '44px',
                height: isMobile ? '36px' : '44px',
                borderRadius: '50%',
                border: `2px solid ${gold}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: `linear-gradient(135deg, rgba(200,151,42,0.15), rgba(200,151,42,0.05))`,
                flexShrink: 0,
              }}>
                {restaurant.logo ? (
                  <img src={restaurant.logo} alt={restaurant.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Store size={isMobile ? 16 : 20} color={gold} />
                )}
              </div>

              {/* Name + Badge */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <span
                  className="navbar-restaurant-name"
                  style={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '16px',
                    letterSpacing: '0.03em',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {restaurant.name}
                </span>
                {restaurant.city && !isMobile && (
                  <span style={{
                    color: gold,
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}>
                    <MapPin size={8} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle' }} />
                    {restaurant.city}
                    {restaurant.state ? `, ${restaurant.state}` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Center Nav — hidden on mobile via CSS */}
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="nav-link-hover"
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease, background-color 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = gold
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(200,151,42,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right: Cart + Phone + Hamburger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {/* Cart — icon only on mobile */}
              <button
                style={{
                  position: 'relative',
                  background: 'rgba(200,151,42,0.1)',
                  border: `1px solid rgba(200,151,42,0.3)`,
                  borderRadius: '10px',
                  padding: isMobile ? '8px 10px' : '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: gold,
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <UtensilsCrossed size={16} />
                <span className="nav-cart-text">Cart</span>
                {cartCount > 0 && (
                  <span
                    className="cart-badge-pulse"
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: gold,
                      color: '#000',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 800,
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Phone — hidden on mobile (shown in drawer instead) */}
              {restaurant.phone && !isMobile && (
                <a
                  href={`tel:${restaurant.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: `linear-gradient(135deg, ${gold}, #a8751a)`,
                    color: '#000',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    letterSpacing: '0.02em',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <Phone size={14} />
                  <span>Call Now</span>
                </a>
              )}

              {/* Phone icon only on mobile */}
              {restaurant.phone && isMobile && (
                <a
                  href={`tel:${restaurant.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    background: `linear-gradient(135deg, ${gold}, #a8751a)`,
                    color: '#000',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  <Phone size={16} />
                </a>
              )}

              {/* Hamburger button — shown via CSS on mobile */}
              <button
                className="hamburger-btn"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

// ━━━ COMPONENT 2: HeroSection ━━━
interface HeroSectionProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  heroImages: string[];
  gold: string;
  menuUrl: string;
  bookingUrl: string;
  showMenu: boolean;
  showBooking: boolean;
}

export function HeroSection({
  restaurant,
  menuItems,
  heroImages,
  gold,
  menuUrl,
  bookingUrl,
  showMenu,
  showBooking,
}: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth <= 768

  // Pick featured items for slides
  const featuredItems = menuItems.filter(
    (item) => item.isFeatured || item.isSignature || item.badge
  ).slice(0, 5)

  const slides = featuredItems.length > 0 ? featuredItems : menuItems.slice(0, 5)

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [isAutoPlaying, slides.length])

  const goTo = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const prev = () => goTo((currentSlide - 1 + slides.length) % slides.length)
  const next = () => goTo((currentSlide + 1) % slides.length)

  const currentItem = slides[currentSlide]
  const bgImage = heroImages[0] || currentItem?.image || getFoodImage(currentItem?.category, currentItem?.name, 0) || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=75&auto=format&fit=crop'

  const getBadgeLabel = (item: MenuItem) => {
    if (item.badge) return item.badge.toUpperCase()
    if (item.isSignature) return "CHEF'S SPECIAL"
    if (item.isFeatured) return 'BESTSELLER'
    return 'NEW ARRIVAL'
  }

  const discountPercent = currentItem?.originalPrice
    ? Math.round(((currentItem.originalPrice - currentItem.price) / currentItem.originalPrice) * 100)
    : 0

  // Fewer particles on mobile for performance
  const allParticles = [
    { size: 4, top: '15%', left: '8%', dur: 12, delay: 0 },
    { size: 6, top: '72%', left: '5%', dur: 17, delay: 2 },
    { size: 5, top: '35%', left: '92%', dur: 14, delay: 1 },
    { size: 8, top: '80%', left: '88%', dur: 10, delay: 3 },
    { size: 4, top: '55%', left: '15%', dur: 20, delay: 5 },
    { size: 7, top: '20%', left: '78%', dur: 9, delay: 0.5 },
    { size: 5, top: '90%', left: '45%', dur: 15, delay: 4 },
    { size: 6, top: '10%', left: '55%', dur: 11, delay: 2.5 },
  ]
  const particles = isMobile ? allParticles.slice(0, 3) : allParticles

  const orbs = [
    { size: 200, top: '10%', left: '60%', dur: 18, opacity: 0.04 },
    { size: 140, top: '65%', left: '10%', dur: 22, opacity: 0.03 },
    { size: 160, top: '40%', left: '80%', dur: 15, opacity: 0.05 },
  ]

  // Image circle size — smaller on mobile
  const imgSize = isMobile ? 240 : 340

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { opacity: 1; }
          100% { transform: translateY(-80px) scale(0.6); opacity: 0; }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes rotateDash {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotateCounterDash {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pricePop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(200,151,42,0.3); }
          50% { box-shadow: 0 0 40px rgba(200,151,42,0.6); }
        }
        .hero-cta-primary {
          background: linear-gradient(135deg, ${gold} 0%, #a8751a 50%, ${gold} 100%);
          background-size: 200% 100%;
          transition: background-position 0.4s ease, transform 0.2s ease, box-shadow 0.3s ease;
        }
        .hero-cta-primary:hover {
          background-position: 100% 0;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(200,151,42,0.45);
        }
        .hero-cta-secondary:hover {
          background: rgba(200,151,42,0.1);
          transform: translateY(-2px);
        }
        .slide-arrow:hover {
          background: ${gold} !important;
          color: #000 !important;
        }
        .trust-badge {
          transition: transform 0.2s ease, background-color 0.2s ease;
        }
        .trust-badge:hover {
          transform: translateY(-2px);
          background: rgba(200,151,42,0.18) !important;
        }
        .marquee-track {
          display: flex;
          white-space: nowrap;
          animation: marqueeScroll 25s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        /* ── Mobile responsive ── */
        @media (max-width: 768px) {
          .hero-main-row {
            flex-direction: column-reverse !important;
            align-items: center !important;
            gap: 1.5rem !important;
          }
          .hero-left-panel {
            flex: none !important;
            min-width: unset !important;
            max-width: 100% !important;
            width: 100% !important;
            text-align: center;
          }
          .hero-right-panel {
            flex: none !important;
            min-width: unset !important;
            width: 100% !important;
          }
          .hero-section-inner {
            min-height: unset !important;
            padding-top: 1.5rem !important;
            padding-bottom: 2rem !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            align-items: flex-start !important;
          }
          .hero-badge-row,
          .hero-city-row,
          .hero-price-row,
          .hero-cta-row,
          .hero-trust-row,
          .hero-slider-controls {
            justify-content: center !important;
          }
        }
      `}</style>

      <section id="hero" style={{ position: 'relative', minHeight: '92vh', overflow: 'hidden', backgroundColor: '#080808' }}>

        {/* ── Background Layers ── */}
        {/* Layer 1: Blurred food image */}
        {bgImage && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px) brightness(0.12)',
            transform: 'scale(1.08)',
          }} />
        )}

        {/* Layer 2: Radial gold glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: `radial-gradient(ellipse 70% 60% at 65% 50%, rgba(200,151,42,0.12) 0%, transparent 65%)`,
        }} />

        {/* Layer 3: Dark overlay bottom */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(8,8,8,0.1) 0%, rgba(8,8,8,0.3) 60%, rgba(8,8,8,0.85) 100%)',
        }} />

        {/* ── Floating Particles ── */}
        {particles.map((p, i) => (
          <div
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: gold,
              zIndex: 1,
              animation: `floatUp ${p.dur}s ${p.delay}s ease-in-out infinite`,
              opacity: 0.6,
            }}
          />
        ))}

        {/* ── Glowing Orbs ── */}
        {orbs.map((orb, i) => (
          <div
            key={`orb-${i}`}
            style={{
              position: 'absolute',
              top: orb.top,
              left: orb.left,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(200,151,42,${orb.opacity * 3}) 0%, rgba(200,151,42,0) 70%)`,
              zIndex: 1,
              animation: `floatOrb ${orb.dur}s ease-in-out infinite`,
              filter: 'blur(20px)',
              opacity: orb.opacity * 15,
            }}
          />
        ))}

        {/* ── Main Content ── */}
        <div
          className="hero-section-inner"
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 2rem',
            minHeight: '92vh',
            display: 'flex',
            alignItems: 'center',
            paddingTop: '3rem',
            paddingBottom: '4rem',
          }}
        >
          <div
            className="hero-main-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3rem',
              width: '100%',
              flexWrap: 'wrap',
            }}
          >

            {/* ── LEFT PANEL (55%) ── */}
            <div className="hero-left-panel" style={{ flex: '0 0 55%', minWidth: '300px', maxWidth: '700px' }}>

              {/* Restaurant name badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="hero-badge-row"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: `1px solid rgba(200,151,42,0.5)`,
                  borderRadius: '999px',
                  padding: '8px 18px',
                  marginBottom: '1.25rem',
                  background: 'rgba(200,151,42,0.07)',
                  backdropFilter: 'blur(8px)',
                  maxWidth: '100%',
                  flexWrap: 'wrap',
                }}
              >
                {restaurant.logo ? (
                  <img src={restaurant.logo} alt="" loading="lazy" decoding="async" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <Store size={16} color={gold} style={{ flexShrink: 0 }} />
                )}
                <span style={{
                  color: gold, fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px',
                }}>
                  {restaurant.name}
                </span>
                <span style={{
                  background: gold,
                  color: '#000',
                  fontSize: '9px',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  flexShrink: 0,
                }}>
                  PREMIUM
                </span>
              </motion.div>

              {/* City line */}
              {restaurant.city && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hero-city-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '13px',
                    marginBottom: '1.25rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  <MapPin size={14} color={gold} />
                  {restaurant.city}{restaurant.state ? `, ${restaurant.state}` : ''}
                </motion.div>
              )}

              {/* Slide Content */}
              {slides.length > 0 && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    {/* Item badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: `linear-gradient(135deg, rgba(200,151,42,0.2), rgba(200,151,42,0.1))`,
                      border: `1px solid rgba(200,151,42,0.4)`,
                      borderRadius: '6px',
                      padding: '5px 12px',
                      marginBottom: '1rem',
                    }}>
                      <Award size={12} color={gold} />
                      <span style={{ color: gold, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em' }}>
                        {currentItem && getBadgeLabel(currentItem)}
                      </span>
                    </div>

                    {/* Item name */}
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: isMobile ? 'clamp(26px, 7vw, 38px)' : 'clamp(36px, 5vw, 64px)',
                      fontWeight: 900,
                      lineHeight: 1.08,
                      letterSpacing: '-0.01em',
                      textTransform: 'uppercase',
                      marginBottom: '0.75rem',
                      textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                      wordBreak: 'break-word',
                    }}>
                      {currentItem?.name}
                    </h1>

                    {/* Description */}
                    {currentItem?.description && (
                      <p style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: isMobile ? '13px' : '15px',
                        lineHeight: 1.65,
                        marginBottom: '1rem',
                        maxWidth: isMobile ? '100%' : '480px',
                      }}>
                        {currentItem.description}
                      </p>
                    )}

                    {/* Price */}
                    <div
                      className="hero-price-row"
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}
                    >
                      <span style={{
                        color: gold,
                        fontSize: isMobile ? 'clamp(28px, 8vw, 40px)' : 'clamp(36px, 4vw, 54px)',
                        fontWeight: 900,
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                        animation: 'pricePop 3s ease-in-out infinite',
                        display: 'inline-block',
                      }}>
                        ₹{currentItem?.price?.toLocaleString('en-IN')}
                      </span>
                      {currentItem?.originalPrice && (
                        <>
                          <span style={{
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: isMobile ? '18px' : '22px',
                            fontWeight: 500,
                            textDecoration: 'line-through',
                          }}>
                            ₹{currentItem.originalPrice.toLocaleString('en-IN')}
                          </span>
                          {discountPercent > 0 && (
                            <span style={{
                              background: '#22c55e',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              letterSpacing: '0.04em',
                            }}>
                              {discountPercent}% OFF
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="hero-cta-row"
                style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}
              >
                {showMenu && (
                  <Link
                    href={menuUrl}
                    className="hero-cta-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#000',
                      fontWeight: 800,
                      fontSize: isMobile ? '13px' : '14px',
                      letterSpacing: '0.06em',
                      padding: isMobile ? '12px 22px' : '14px 28px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      border: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ORDER NOW →
                  </Link>
                )}
                {showBooking && (
                  <Link
                    href={bookingUrl}
                    className="hero-cta-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: gold,
                      fontWeight: 700,
                      fontSize: isMobile ? '13px' : '14px',
                      letterSpacing: '0.04em',
                      padding: isMobile ? '12px 22px' : '14px 28px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      border: `1.5px solid rgba(200,151,42,0.5)`,
                      background: 'transparent',
                      transition: 'all 0.25s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Calendar size={16} />
                    Book Table
                  </Link>
                )}
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="hero-trust-row"
                style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
              >
                {[
                  { icon: <Flame size={12} />, label: 'Fresh Daily' },
                  { icon: <Clock size={12} />, label: 'Fast Delivery' },
                  { icon: <Star size={12} />, label: 'Top Rated' },
                  { icon: <Award size={12} />, label: '100% Hygienic' },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className="trust-badge"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(200,151,42,0.08)',
                      border: '1px solid rgba(200,151,42,0.2)',
                      borderRadius: '999px',
                      padding: '5px 12px',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      cursor: 'default',
                    }}
                  >
                    <span style={{ color: gold }}>{badge.icon}</span>
                    {badge.label}
                  </div>
                ))}
              </motion.div>

              {/* Slider Controls */}
              {slides.length > 1 && (
                <div
                  className="hero-slider-controls"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '1.5rem' }}
                >
                  <button
                    onClick={prev}
                    className="slide-arrow"
                    style={{
                      width: isMobile ? '34px' : '40px',
                      height: isMobile ? '34px' : '40px',
                      borderRadius: '50%',
                      border: `1.5px solid rgba(200,151,42,0.4)`,
                      background: 'rgba(200,151,42,0.08)',
                      color: gold,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <ChevronLeft size={isMobile ? 15 : 18} />
                  </button>

                  {/* Dots */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        style={{
                          width: i === currentSlide ? '22px' : '7px',
                          height: '7px',
                          borderRadius: '999px',
                          background: i === currentSlide ? gold : 'rgba(200,151,42,0.3)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={next}
                    className="slide-arrow"
                    style={{
                      width: isMobile ? '34px' : '40px',
                      height: isMobile ? '34px' : '40px',
                      borderRadius: '50%',
                      border: `1.5px solid rgba(200,151,42,0.4)`,
                      background: 'rgba(200,151,42,0.08)',
                      color: gold,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <ChevronRight size={isMobile ? 15 : 18} />
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT PANEL ── */}
            <div
              className="hero-right-panel"
              style={{
                flex: '1',
                minWidth: '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`img-${currentSlide}`}
                  initial={{ opacity: 0, scale: 0.88, rotate: -3 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.88, rotate: 3 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  style={{ position: 'relative', width: `${imgSize}px`, height: `${imgSize}px` }}
                >
                  {/* Inner glow behind image */}
                  <div style={{
                    position: 'absolute',
                    inset: '-10px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(200,151,42,0.18) 0%, transparent 70%)`,
                    zIndex: 0,
                    filter: 'blur(10px)',
                  }} />

                  {/* Outer rotating dashed ring */}
                  <div style={{
                    position: 'absolute',
                    inset: '-18px',
                    borderRadius: '50%',
                    border: `2px dashed rgba(200,151,42,0.35)`,
                    animation: 'rotateDash 18s linear infinite',
                    zIndex: 1,
                  }} />

                  {/* Inner rotating dashed ring (counter) */}
                  <div style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '50%',
                    border: `1.5px dashed rgba(200,151,42,0.2)`,
                    animation: 'rotateCounterDash 12s linear infinite',
                    zIndex: 1,
                  }} />

                  {/* Main circular image */}
                  <div style={{
                    position: 'relative',
                    width: `${imgSize}px`,
                    height: `${imgSize}px`,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `3px solid rgba(200,151,42,0.5)`,
                    zIndex: 2,
                    animation: 'glowPulse 4s ease-in-out infinite',
                    background: 'rgba(20,20,20,0.8)',
                  }}>
                    <img
                      src={currentItem?.image || getFoodImage(currentItem?.category, currentItem?.name, currentSlide)}
                      alt={currentItem?.name || 'Food'}
                      fetchPriority={currentSlide === 0 ? 'high' : 'low'}
                      loading={currentSlide === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFoodImage(currentItem?.category, currentItem?.name, currentSlide)
                      }}
                    />
                  </div>

                  {/* Price badge (floating bottom-right) — scaled for mobile */}
                  {currentItem && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                      style={{
                        position: 'absolute',
                        bottom: isMobile ? '8px' : '12px',
                        right: isMobile ? '8px' : '12px',
                        zIndex: 10,
                        width: isMobile ? '56px' : '72px',
                        height: isMobile ? '56px' : '72px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${gold}, #a8751a)`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 20px rgba(200,151,42,0.5)`,
                        border: '2px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <span style={{ color: '#000', fontSize: isMobile ? '7px' : '9px', fontWeight: 700, letterSpacing: '0.06em' }}>FROM</span>
                      <span style={{ color: '#000', fontSize: isMobile ? '12px' : '16px', fontWeight: 900, lineHeight: 1.1 }}>
                        ₹{currentItem.price}
                      </span>
                    </motion.div>
                  )}

                  {/* Veg/Non-veg indicator */}
                  {currentItem && (
                    <div style={{
                      position: 'absolute',
                      top: isMobile ? '10px' : '16px',
                      left: isMobile ? '10px' : '16px',
                      zIndex: 10,
                      width: '28px',
                      height: '28px',
                      borderRadius: '4px',
                      border: `2px solid ${currentItem.isVeg ? '#22c55e' : '#ef4444'}`,
                      background: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: currentItem.isVeg ? '#22c55e' : '#ef4444',
                      }} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div style={{
        background: gold,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 3,
        borderTop: '1px solid rgba(0,0,0,0.15)',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
      }}>
        <div style={{ padding: '11px 0', display: 'flex' }}>
          <div className="marquee-track">
            {[1, 2].map((copy) => (
              <span
                key={copy}
                style={{
                  display: 'inline-block',
                  color: '#0a0a0a',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  paddingRight: '0',
                }}
              >
                {'100% FRESH ✦ ZOMATO & SWIGGY PARTNER ✦ NO HIDDEN CHARGES ✦ PREMIUM QUALITY INGREDIENTS ✦ FREE DELIVERY ✦ 30 MIN GUARANTEE ✦ 4.8★ RATED ✦ ORDER ONLINE ✦ BOOK YOUR TABLE ✦      '}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
