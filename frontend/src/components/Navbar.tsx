'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart, Menu, X, MapPin, ChevronDown, LogOut, User, LayoutDashboard, ShieldCheck, Search, Navigation } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useRestaurantPage } from '@/context/RestaurantPageContext'
import CartDrawer from '@/components/CartDrawer'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/#menu', label: 'Menu' },
  { href: '/#deals', label: 'Deals' },
  { href: '/#book-table', label: 'Book Table', bookingLink: true },
  { href: '/contact', label: 'Contact' },
]

const ORDER_MODES: { key: 'delivery' | 'dinein' | 'takeaway'; label: string }[] = [
  { key: 'delivery', label: 'Delivery' },
  { key: 'dinein', label: 'Dine In' },
  { key: 'takeaway', label: 'Takeaway' },
]

const ADMIN_ROLES = ['super_admin', 'master_admin', 'admin', 'manager', 'staff', 'cashier', 'restaurant_owner']

const POPULAR_LOCATIONS = [
  'Sector 18, Noida',
  'Connaught Place, Delhi',
  'Cyber City, Gurugram',
  'Indiranagar, Bengaluru',
  'Bandra West, Mumbai',
  'Koregaon Park, Pune',
  'Salt Lake, Kolkata',
  'T. Nagar, Chennai',
]

interface StoredUser {
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [orderMode, setOrderMode] = useState<'delivery' | 'dinein' | 'takeaway'>('delivery')
  const { getCartCount, isCartDrawerOpen, openCartDrawer, closeCartDrawer } = useCart()
  const { restaurant } = useRestaurantPage()
  const cartCount = getCartCount(restaurant?.slug)
  const bookingSlug = restaurant?.slug || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('restaurant') : null) || process.env.NEXT_PUBLIC_RESTAURANT_SLUG || 'spice-garden'
  const [activeLink, setActiveLink] = useState('/')
  const [user, setUser] = useState<StoredUser | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [location, setLocation] = useState('Sector 18, Noida')
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [locating, setLocating] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)
  const mobileLocationRef = useRef<HTMLDivElement>(null)
  const [mobileLocationOpen, setMobileLocationOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [activeLink])

  // Load user & location from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('restro-user')
      if (stored) setUser(JSON.parse(stored))
      const savedLoc = localStorage.getItem('restro-location')
      if (savedLoc) setLocation(savedLoc)
    } catch { /* ignore */ }
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false)
        setLocationSearch('')
      }
      if (mobileLocationRef.current && !mobileLocationRef.current.contains(e.target as Node)) {
        setMobileLocationOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('restro-token')
    localStorage.removeItem('restro-user')
    setUser(null)
    setProfileOpen(false)
    window.location.href = '/'
  }

  const getInitial = (name: string) => name.charAt(0).toUpperCase()

  const getDashboardLink = (role: string) => {
    if (role === 'super_admin') return '/admin/super'
    if (role === 'master_admin') return '/admin/master'
    return '/dashboard'
  }

  const isAdmin = user && ADMIN_ROLES.includes(user.role) && user.role !== 'customer'

  const handleLocationSelect = (loc: string) => {
    setLocation(loc)
    localStorage.setItem('restro-location', loc)
    setLocationOpen(false)
    setMobileLocationOpen(false)
    setLocationSearch('')
  }

  const filteredLocations = locationSearch.trim()
    ? POPULAR_LOCATIONS.filter(l => l.toLowerCase().includes(locationSearch.toLowerCase()))
    : POPULAR_LOCATIONS

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const a = data.address || {}
          const area = a.suburb || a.neighbourhood || a.village || a.town || a.county || ''
          const city = a.city || a.state_district || a.state || ''
          const label = area && city ? `${area}, ${city}` : city || area || data.display_name?.split(',')[0] || 'Your Location'
          handleLocationSelect(label)
        } catch {
          handleLocationSelect('Your Location')
        } finally {
          setLocating(false)
        }
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }

  return (
    <>
      {/* ── TOP BAR ── */}
      <div
        className="hidden md:flex items-center justify-between px-6 h-9 text-xs font-semibold text-white/90"
        style={{ background: '#0d0a04', borderBottom: '1px solid rgba(200,151,42,0.2)' }}
      >
        <span className="flex items-center gap-1.5 tracking-wide">
          🚴 Free Delivery on orders above ₹299
        </span>
        <div className="flex items-center gap-0.5">
          {ORDER_MODES.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setOrderMode(mode.key)}
              className="transition-all duration-200"
              style={{
                padding: '3px 14px', borderRadius: '100px', fontSize: '11px',
                fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', border: 'none',
                background: orderMode === mode.key ? 'rgba(255,255,255,0.22)' : 'transparent',
                color: orderMode === mode.key ? '#ffffff' : 'rgba(255,255,255,0.6)',
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <motion.nav
        className="sticky top-0 z-50 w-full"
        style={{
          background: isScrolled ? 'rgba(8,5,0,0.97)' : 'rgba(8,5,0,0.65)',
          backdropFilter: isScrolled ? 'blur(18px) saturate(160%)' : 'blur(8px)',
          borderBottom: isScrolled ? '1px solid rgba(200,151,42,0.2)' : '1px solid rgba(255,255,255,0.06)',
          transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[68px]">

            {/* ── LOGO ── */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #8b5a00, #c8972a)', boxShadow: '0 4px 14px rgba(200,151,42,0.45)' }}
              >
                <span style={{ fontSize: '20px' }}>🔥</span>
              </div>
              <div>
                <div className="font-extrabold text-white leading-none tracking-tight" style={{ fontSize: '19px' }}>
                  <span style={{ background: 'linear-gradient(90deg, #f0c060, #e8d5a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Restro
                  </span>
                  <span style={{ color: '#ffffff' }}> OS</span>
                  <span
                    className="inline-block align-middle ml-1.5"
                    style={{ fontSize: '9px', fontWeight: 800, background: 'linear-gradient(135deg, #c8972a, #f0c060)', color: '#080808', borderRadius: '4px', padding: '2px 6px', letterSpacing: '0.1em' }}
                  >
                    PREMIUM
                  </span>
                </div>
                <div className="text-[11px] font-medium mt-0.5 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <MapPin size={10} />
                  {location}
                </div>
              </div>
            </Link>

            {/* ── DESKTOP NAV LINKS ── */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = activeLink === link.href
                const href = (link as any).bookingLink
                  ? `/booking?restaurant=${bookingSlug}`
                  : link.href
                return (
                  <Link
                    key={link.href}
                    href={href}
                    onClick={() => setActiveLink(link.href)}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                    style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)' }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = '#f0c060' }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)' }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                        style={{ background: '#c8972a' }}
                        layoutId="nav-underline-gold"
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* ── RIGHT ACTIONS ── */}
            <div className="flex items-center gap-2 md:gap-3">

              {/* Location picker */}
              <div ref={locationRef} className="hidden md:block relative">
                <motion.button
                  onClick={() => { setLocationOpen(v => !v); setLocationSearch('') }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '100px', cursor: 'pointer', border: 'none',
                    background: locationOpen ? 'rgba(200,151,42,0.15)' : 'rgba(200,151,42,0.08)',
                    borderWidth: '1px', borderStyle: 'solid',
                    borderColor: locationOpen ? 'rgba(200,151,42,0.45)' : 'rgba(200,151,42,0.2)',
                    color: 'rgba(255,255,255,0.85)',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <MapPin size={12} style={{ color: '#c8972a', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {location}
                  </span>
                  <motion.div animate={{ rotate: locationOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={11} style={{ color: 'rgba(255,255,255,0.45)' }} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {locationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                        width: '260px', background: '#141414',
                        border: '1px solid rgba(200,151,42,0.22)', borderRadius: '16px',
                        overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                        zIndex: 100,
                      }}
                    >
                      {/* Detect location button */}
                      <div style={{ padding: '10px 10px 0' }}>
                        <button onClick={detectLocation} disabled={locating}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            padding: '10px 12px', borderRadius: '10px', cursor: locating ? 'not-allowed' : 'pointer',
                            background: 'rgba(200,151,42,0.1)', border: '1px solid rgba(200,151,42,0.25)',
                            color: '#f0c060', fontSize: '13px', fontWeight: 600, transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => { if (!locating) (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.18)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.1)' }}
                        >
                          {locating ? (
                            <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '2px solid rgba(240,192,96,0.3)', borderTopColor: '#f0c060', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                          ) : (
                            <Navigation size={13} />
                          )}
                          {locating ? 'Detecting…' : 'Use my current location'}
                        </button>
                      </div>

                      {/* Search input */}
                      <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(200,151,42,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)', borderRadius: '10px', padding: '8px 12px' }}>
                          <Search size={13} color="#c8972a" />
                          <input
                            autoFocus
                            type="text"
                            placeholder="Search location…"
                            value={locationSearch}
                            onChange={e => setLocationSearch(e.target.value)}
                            style={{ background: 'none', border: 'none', outline: 'none', color: '#f8f4ed', fontSize: '13px', width: '100%' }}
                          />
                        </div>
                      </div>

                      {/* Popular locations */}
                      <div style={{ padding: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                        <p style={{ color: '#6b5040', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 10px 4px' }}>
                          {locationSearch ? 'Results' : 'Popular Locations'}
                        </p>
                        {filteredLocations.length === 0 ? (
                          <p style={{ color: '#a89070', fontSize: '13px', padding: '10px 12px' }}>No results found</p>
                        ) : filteredLocations.map((loc, i) => (
                          <button key={i} onClick={() => handleLocationSelect(loc)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                              padding: '10px 12px', borderRadius: '9px', background: loc === location ? 'rgba(200,151,42,0.1)' : 'none',
                              border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (loc !== location) (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.07)' }}
                            onMouseLeave={e => { if (loc !== location) (e.currentTarget as HTMLElement).style.background = 'none' }}
                          >
                            {loc === location
                              ? <Navigation size={13} color="#c8972a" />
                              : <MapPin size={13} color="#6b5040" />
                            }
                            <span style={{ color: loc === location ? '#f0c060' : '#a89070', fontSize: '13px', fontWeight: loc === location ? 600 : 400 }}>
                              {loc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart button */}
              <button onClick={openCartDrawer} className="relative flex items-center justify-center" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: '#c8972a' }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <ShoppingCart size={18} className="text-white" />
                </motion.div>
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 rounded-full flex items-center justify-center font-bold"
                      style={{ background: '#f0c060', color: '#080808', fontSize: '10px', minWidth: '18px', height: '18px', padding: '0 3px' }}
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* ── PROFILE or LOGIN ── */}
              {user ? (
                <div ref={profileRef} className="relative hidden md:block">
                  <motion.button
                    onClick={() => setProfileOpen(v => !v)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'rgba(200,151,42,0.1)', border: '1.5px solid rgba(200,151,42,0.35)',
                      borderRadius: '100px', padding: '5px 14px 5px 5px', cursor: 'pointer',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5a00, #c8972a)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 800, color: '#fff8e8', flexShrink: 0,
                    }}>
                      {getInitial(user.name)}
                    </div>
                    <span style={{ color: '#f8f4ed', fontSize: '13px', fontWeight: 600, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={13} style={{ color: '#c8972a', transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </motion.button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                          width: '220px', background: '#141414',
                          border: '1px solid rgba(200,151,42,0.2)', borderRadius: '14px',
                          overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                          zIndex: 100,
                        }}
                      >
                        {/* User info */}
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(200,151,42,0.12)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #8b5a00, #c8972a)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '18px', fontWeight: 800, color: '#fff8e8', flexShrink: 0,
                            }}>
                              {getInitial(user.name)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ color: '#f8f4ed', fontSize: '14px', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name}
                              </p>
                              <p style={{ color: '#a89070', fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                          {/* Role badge */}
                          <div style={{
                            marginTop: '8px', display: 'inline-block',
                            background: 'rgba(200,151,42,0.12)', border: '1px solid rgba(200,151,42,0.2)',
                            borderRadius: '6px', padding: '2px 8px', fontSize: '10px',
                            fontWeight: 700, color: '#f0c060', letterSpacing: '0.06em', textTransform: 'uppercase',
                          }}>
                            {user.role.replace('_', ' ')}
                          </div>
                        </div>

                        {/* Menu items */}
                        <div style={{ padding: '6px' }}>
                          <Link href="/profile" onClick={() => setProfileOpen(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '10px 12px', borderRadius: '8px', color: '#a89070',
                              fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                              transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.08)'; (e.currentTarget as HTMLElement).style.color = '#f8f4ed' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#a89070' }}
                          >
                            <User size={15} />
                            My Profile
                          </Link>

                          {isAdmin && (
                            <Link href={getDashboardLink(user.role)} onClick={() => setProfileOpen(false)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 12px', borderRadius: '8px', color: '#a89070',
                                fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                                transition: 'background 0.15s, color 0.15s',
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,151,42,0.08)'; (e.currentTarget as HTMLElement).style.color = '#f0c060' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#a89070' }}
                            >
                              {user.role === 'super_admin' ? <ShieldCheck size={15} /> : <LayoutDashboard size={15} />}
                              {user.role === 'super_admin' ? 'Super Admin Panel' : 'Dashboard'}
                            </Link>
                          )}

                          <button
                            onClick={handleLogout}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                              padding: '10px 12px', borderRadius: '8px', color: '#e05555',
                              fontSize: '13px', fontWeight: 500, background: 'none', border: 'none',
                              cursor: 'pointer', transition: 'background 0.15s',
                              marginTop: '2px',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.1)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  {/* Plans & Pricing link — visible only when not logged in */}
                  <Link
                    href="/pricing"
                    className="hidden md:inline-flex items-center"
                    style={{ color: '#a89070', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(200,151,42,0.3)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#f0c060'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200,151,42,0.6)'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(200,151,42,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#a89070'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200,151,42,0.3)'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
                  >
                    Plans &amp; Pricing
                  </Link>

                  <Link href="/login" className="hidden md:inline-flex">
                    <motion.span
                      className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200"
                      style={{ border: '1.5px solid rgba(200,151,42,0.6)', color: '#f0c060', background: 'transparent' }}
                      whileHover={{ background: '#c8972a', color: '#080808' }}
                      whileTap={{ scale: 0.96 }}
                    >
                      Login
                    </motion.span>
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <motion.button
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                onClick={() => setIsMenuOpen((v) => !v)}
                whileTap={{ scale: 0.93 }}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── MOBILE DROPDOWN ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-x-0 z-40"
            style={{ top: '68px', background: 'rgba(8,6,0,0.97)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(200,151,42,0.2)' }}
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container mx-auto px-4 py-5 space-y-1">

              {/* Mobile user info (if logged in) */}
              {user && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', marginBottom: '12px',
                  background: 'rgba(200,151,42,0.08)', border: '1px solid rgba(200,151,42,0.2)',
                  borderRadius: '12px',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #8b5a00, #c8972a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 800, color: '#fff8e8',
                  }}>
                    {getInitial(user.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: '#f8f4ed', fontSize: '14px', fontWeight: 700, margin: 0 }}>{user.name}</p>
                    <p style={{ color: '#a89070', fontSize: '11px', margin: 0 }}>{user.role.replace('_', ' ')}</p>
                  </div>
                </div>
              )}

              {/* Mobile location picker */}
              <div ref={mobileLocationRef} style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => setMobileLocationOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '11px 14px', borderRadius: '12px', cursor: 'pointer', border: 'none',
                    background: mobileLocationOpen ? 'rgba(200,151,42,0.15)' : 'rgba(200,151,42,0.08)',
                    borderWidth: '1px', borderStyle: 'solid',
                    borderColor: mobileLocationOpen ? 'rgba(200,151,42,0.4)' : 'rgba(200,151,42,0.2)',
                  }}
                >
                  <MapPin size={14} color="#c8972a" />
                  <span style={{ color: '#f8f4ed', fontSize: '13px', fontWeight: 600, flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {location}
                  </span>
                  <motion.div animate={{ rotate: mobileLocationOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={13} color="rgba(255,255,255,0.45)" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {mobileLocationOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ background: '#1a1a1a', border: '1px solid rgba(200,151,42,0.18)', borderRadius: '12px', marginTop: '6px', overflow: 'hidden' }}>
                        {/* Detect */}
                        <button onClick={detectLocation} disabled={locating}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 14px', background: 'none', border: 'none', borderBottom: '1px solid rgba(200,151,42,0.1)', cursor: locating ? 'not-allowed' : 'pointer', color: '#f0c060', fontSize: '13px', fontWeight: 600 }}>
                          {locating
                            ? <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '2px solid rgba(240,192,96,0.3)', borderTopColor: '#f0c060', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                            : <Navigation size={13} />}
                          {locating ? 'Detecting…' : 'Use my current location'}
                        </button>
                        {/* Search */}
                        <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(200,151,42,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Search size={13} color="#c8972a" />
                          <input type="text" placeholder="Search location…" value={locationSearch}
                            onChange={e => setLocationSearch(e.target.value)}
                            style={{ background: 'none', border: 'none', outline: 'none', color: '#f8f4ed', fontSize: '13px', width: '100%' }} />
                        </div>
                        {/* List */}
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {filteredLocations.map((loc, i) => (
                            <button key={i} onClick={() => handleLocationSelect(loc)}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', background: loc === location ? 'rgba(200,151,42,0.1)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                              {loc === location ? <Navigation size={13} color="#c8972a" /> : <MapPin size={13} color="#6b5040" />}
                              <span style={{ color: loc === location ? '#f0c060' : '#a89070', fontSize: '13px', fontWeight: loc === location ? 600 : 400 }}>{loc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Order-mode tabs */}
              <div
                className="flex items-center gap-1 mb-4 p-1 rounded-xl"
                style={{ background: 'rgba(200,151,42,0.12)', border: '1px solid rgba(200,151,42,0.25)' }}
              >
                {ORDER_MODES.map((mode) => (
                  <button key={mode.key} onClick={() => setOrderMode(mode.key)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200"
                    style={{ background: orderMode === mode.key ? '#c8972a' : 'transparent', color: orderMode === mode.key ? '#ffffff' : 'rgba(255,255,255,0.5)' }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Nav links */}
              {NAV_LINKS.map((link, i) => {
                const isActive = activeLink === link.href
                const mobileHref = (link as any).bookingLink
                  ? `/booking?restaurant=${bookingSlug}`
                  : link.href
                return (
                  <motion.div key={link.href} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.055, duration: 0.22 }}>
                    <Link
                      href={mobileHref}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-colors"
                      style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent', borderLeft: isActive ? '2px solid #c8972a' : '2px solid transparent' }}
                      onClick={() => { setActiveLink(link.href); setIsMenuOpen(false) }}
                    >
                      {link.label}
                      {isActive && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c8972a' }} />}
                    </Link>
                  </motion.div>
                )
              })}

              {/* Plans & Pricing mobile link — visible only when not logged in */}
              {!user && (
                <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: NAV_LINKS.length * 0.055, duration: 0.22 }}>
                  <Link
                    href="/pricing"
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: '#a89070', background: 'transparent', borderLeft: '2px solid transparent' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Plans &amp; Pricing
                  </Link>
                </motion.div>
              )}

              {/* Mobile CTA row */}
              <div className="pt-4 pb-2 flex gap-2.5">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 rounded-full text-sm font-semibold"
                    style={{ border: '1.5px solid rgba(220,38,38,0.5)', color: '#fca5a5', background: 'transparent' }}
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link href="/login" className="flex-1">
                    <button className="w-full py-3 rounded-full text-sm font-semibold transition-all"
                      style={{ border: '1.5px solid rgba(200,151,42,0.6)', color: '#f0c060', background: 'transparent' }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </button>
                  </Link>
                )}
                {!user && (
                  <Link href="/signup" className="flex-1">
                    <button className="w-full py-3 rounded-full text-sm font-bold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #8b5a00, #c8972a)', boxShadow: '0 4px 16px rgba(200,151,42,0.4)' }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CartDrawer isOpen={isCartDrawerOpen} onClose={closeCartDrawer} />
    </>
  )
}
