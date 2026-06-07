'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Clock, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

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

// ─── Shared TypeScript Interfaces ───────────────────────────────────────────

interface Restaurant {
  _id: string; name: string; slug: string;
  status?: string; subscriptionStatus?: string;
  description?: string; city?: string; state?: string;
  address?: string; phone?: string; email?: string;
  primaryColor?: string; logo?: string;
  openingTime?: string; closingTime?: string;
  features?: Record<string, boolean | undefined>;
}

interface Review {
  _id: string; customerName?: string; rating: number;
  comment?: string; createdAt?: string;
}

// ─── Utility: Generate time slots ───────────────────────────────────────────

function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = 12; hour <= 23; hour++) {
    for (const min of [0, 30]) {
      const h = hour > 12 ? hour - 12 : hour
      const ampm = hour >= 12 ? 'PM' : 'AM'
      slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm}`)
    }
  }
  return slots
}

function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

function useIntersectionObserver(ref: React.RefObject<Element | null>, options?: IntersectionObserverInit): boolean {
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect() }
    }, options)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, options])
  return isVisible
}

function useAnimatedCounter(target: number, isVisible: boolean, duration = 1500): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isVisible) return
    const steps = 60
    const stepTime = duration / steps
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, stepTime)
    return () => clearInterval(timer)
  }, [isVisible, target, duration])
  return count
}

// ─── Input base styles ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0e0e0e',
  border: '1px solid #2a2a2a',
  borderRadius: 10,
  padding: '12px 16px',
  color: '#f0f0f0',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  colorScheme: 'dark',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#a3a3a3',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 2,
  textTransform: 'uppercase',
  marginBottom: 6,
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT 1: DineWithUsSection
// ═══════════════════════════════════════════════════════════════════════════════

interface DineWithUsSectionProps {
  restaurant: Restaurant
  gold: string
  bookingUrl: string
  showBooking: boolean
}

export function DineWithUsSection({ restaurant, gold }: DineWithUsSectionProps) {
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '', guests: '2', requests: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const timeSlots = generateTimeSlots()
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 640

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => { setSubmitting(false); setSubmitted(true) }, 900)
  }

  return (
    <section style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', width: '100%', minHeight: isMobile ? 'auto' : '100vh', overflow: 'hidden' }}>
      {/* ── LEFT: Atmospheric Image ─────────────────────────────────────── */}
      <div style={{ position: 'relative', flex: '1 1 400px', minHeight: isMobile ? 320 : 420 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
          alt="Fine dining atmosphere"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.6), rgba(0,0,0,0.2))' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent, rgba(0,0,0,0.15))' }} />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: isMobile ? '36px 20px' : '60px 48px', maxWidth: 540 }}>
          <motion.span
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
            style={{ display: 'inline-block', marginBottom: 20, padding: '6px 16px', borderRadius: 100, border: `1px solid ${gold}`, color: gold, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}
          >
            ✦ PREMIUM DINING
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }} viewport={{ once: true }}
            style={{ color: '#ffffff', fontSize: isMobile ? 'clamp(28px,8vw,40px)' : 'clamp(36px,6vw,64px)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 20px', fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: '-0.5px' }}
          >
            Dine<br /><span style={{ color: gold }}>With Us</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15 }} viewport={{ once: true }}
            style={{ color: '#e0e0e0', fontSize: 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 340 }}
          >
            Reserve your table and experience exceptional cuisine crafted with love. Every meal is a journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.22 }} viewport={{ once: true }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}
          >
            {['Candlelight Dining', 'Live Music', 'Private Events', 'Valet Parking'].map(chip => (
              <div key={chip} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#e0e0e0', fontSize: 14 }}>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>✓</span>
                <span>{chip}</span>
              </div>
            ))}
          </motion.div>

          {(restaurant.openingTime || restaurant.closingTime) && (
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: gold }}
            >
              <Clock size={16} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>{restaurant.openingTime ?? '—'} – {restaurant.closingTime ?? '—'}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Booking Form ─────────────────────────────────────────── */}
      <div style={{ flex: '1 1 400px', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '36px 16px' : '60px 32px' }}>
        <motion.div
          initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          {/* Form header */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ color: gold, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>✦ RESERVATIONS</p>
            <h3 style={{ color: '#ffffff', fontSize: 28, fontWeight: 700, margin: '0 0 6px' }}>Book a Table</h3>
            <p style={{ color: '#a3a3a3', fontSize: 14, margin: 0 }}>Reserve your table in seconds</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
              style={{ borderRadius: 16, border: `1px solid ${gold}`, padding: 32, textAlign: 'center', background: '#111' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: gold + '22', fontSize: 28 }}>🎉</div>
              <h4 style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Reservation Confirmed!</h4>
              <p style={{ color: '#d4d4d4', fontSize: 14, lineHeight: 1.6, margin: 0 }}>Table reserved! We&apos;ll confirm via SMS.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', date: '', time: '', guests: '2', requests: '' }) }}
                style={{ marginTop: 20, fontSize: 12, textDecoration: 'underline', background: 'none', border: 'none', color: gold, cursor: 'pointer' }}
              >
                Make another reservation
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Your Name</label>
                <input type="text" name="name" required placeholder="Enter your full name" value={form.name} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" name="phone" required placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: windowWidth < 360 ? '1fr' : '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" name="date" required min={todayString()} value={form.date} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Time</label>
                  <select name="time" required value={form.time} onChange={handleChange} style={inputStyle}>
                    <option value="">Select time</option>
                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Number of Guests</label>
                <select name="guests" value={form.guests} onChange={handleChange} style={inputStyle}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Special Requests <span style={{ textTransform: 'none', color: '#525252' }}>(optional)</span></label>
                <textarea name="requests" rows={3} placeholder="Anniversary, dietary requirements, seating preference…" value={form.requests} onChange={handleChange} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <button
                type="submit"
                disabled={submitting}
                style={{ width: '100%', padding: '16px 0', borderRadius: 12, background: `linear-gradient(135deg, ${gold}, #b8860b)`, color: '#0a0a0a', fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, boxShadow: `0 4px 24px ${gold}44` }}
              >
                {submitting ? 'Reserving…' : 'RESERVE MY TABLE →'}
              </button>
              {restaurant.phone && (
                <p style={{ textAlign: 'center', fontSize: 12, color: '#737373', margin: 0 }}>
                  Or call us:{' '}
                  <a href={`tel:${restaurant.phone}`} style={{ color: gold, fontWeight: 600 }}>{restaurant.phone}</a>
                </p>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT 2: StatsSection
// ═══════════════════════════════════════════════════════════════════════════════

interface StatsSectionProps {
  restaurant: Restaurant
  gold: string
  menuItems?: unknown[]
  reviews?: unknown[]
}

const STATS = [
  { emoji: '🍽️', value: 5000, suffix: '+', label: 'Happy Customers', sub: 'Smiling faces served' },
  { emoji: '⭐', value: 48, suffix: '/5', label: 'Avg Rating', sub: 'From verified reviews', divideBy: 10 },
  { emoji: '⚡', value: 30, suffix: ' min', label: 'Avg Delivery', sub: 'Fast & hot every time' },
  { emoji: '🏆', value: 1, suffix: '', label: 'In Our Area', sub: 'Consistently top-ranked', static: '#1 Rated' },
]

function StatCard({ stat, isVisible, gold, index }: { stat: typeof STATS[number]; isVisible: boolean; gold: string; index: number }) {
  const rawCount = useAnimatedCounter(stat.value, isVisible, 1400)
  const display = stat.divideBy
    ? (rawCount / stat.divideBy).toFixed(1) + '/5'
    : stat.static ?? `${rawCount}${stat.suffix}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }} animate={isVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: index * 0.1 }}
      style={{ position: 'relative', background: '#141414', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden', borderLeft: `4px solid ${gold}` }}
    >
      <div style={{ position: 'absolute', top: -32, left: -16, width: 96, height: 96, borderRadius: '50%', background: gold, filter: 'blur(24px)', opacity: 0.1, pointerEvents: 'none' }} />
      <div style={{ fontSize: 36, marginBottom: 4 }}>{stat.emoji}</div>
      <div style={{ color: gold, fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900 }}>{display}</div>
      <div style={{ color: '#ffffff', fontSize: 15, fontWeight: 700 }}>{stat.label}</div>
      <div style={{ color: '#a3a3a3', fontSize: 12 }}>{stat.sub}</div>
    </motion.div>
  )
}

export function StatsSection({ restaurant, gold }: StatsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.2 })
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 640

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative', width: '100%', padding: isMobile ? '56px 16px' : '96px 16px', overflow: 'hidden',
        background: '#0a0a0a',
        backgroundImage:
          'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.015) 40px,rgba(255,255,255,0.015) 41px),' +
          'repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.015) 40px,rgba(255,255,255,0.015) 41px)',
      }}
    >
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} viewport={{ once: true }}
            style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 100, border: `1px solid ${gold}`, color: gold, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}
          >
            ✦ REAL NUMBERS
          </motion.span>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} viewport={{ once: true }}>
            <h2 style={{ color: '#ffffff', fontSize: 'clamp(28px,5vw,56px)', fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
              Results That Speak
            </h2>
            <p style={{ color: gold, fontSize: 'clamp(22px,4vw,40px)', fontWeight: 700, margin: '4px 0 0' }}>
              Louder Than Words
            </p>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.18 }} viewport={{ once: true }}
            style={{ color: '#a3a3a3', fontSize: 14, marginTop: 14, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}
          >
            Real numbers from customers who trust us
          </motion.p>
        </div>

        {/* Stat cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 20, marginBottom: isMobile ? 32 : 56 }}>
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} isVisible={isVisible} gold={gold} index={i} />
          ))}
        </div>

        {/* Testimonial quote strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.3 }} viewport={{ once: true }}
          style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 32, textAlign: 'center', background: `linear-gradient(135deg, ${gold}18, ${gold}06)`, border: `1px solid ${gold}33` }}
        >
          <Quote size={28} style={{ display: 'block', margin: '0 auto 16px', color: gold, opacity: 0.5 }} />
          <p style={{ color: '#e0e0e0', fontSize: 'clamp(14px,2vw,18px)', fontStyle: 'italic', lineHeight: 1.7, maxWidth: 720, margin: '0 auto' }}>
            &ldquo;Billing errors dropped by 90% in the first week. My cashier used to spend 2 hours on billing, it takes 10 minutes now.&rdquo;
          </p>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: gold, color: '#000', fontWeight: 700, fontSize: 13 }}>R</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: '#ffffff', fontSize: 14, fontWeight: 600, margin: 0 }}>Restaurant Owner</p>
              <p style={{ color: '#737373', fontSize: 12, margin: 0 }}>Verified Customer</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT 3: TestimonialsSection
// ═══════════════════════════════════════════════════════════════════════════════

interface TestimonialsSectionProps {
  reviews: Review[]
  gold: string
  restaurant: Restaurant
}

const MOCK_REVIEWS: Review[] = [
  { _id: 'm1', customerName: 'Priya Sharma', rating: 5, comment: 'Absolutely stunning experience. The food was divine and the ambiance made our anniversary unforgettable.', createdAt: '2025-11-12T00:00:00Z' },
  { _id: 'm2', customerName: 'Rahul Mehta', rating: 5, comment: "Best dining experience in the city. The chef's special was outstanding — flavors I've never experienced before.", createdAt: '2025-12-03T00:00:00Z' },
  { _id: 'm3', customerName: 'Anjali Verma', rating: 5, comment: 'Perfect evening with impeccable service. Every dish arrived beautifully plated and tasted even better.', createdAt: '2026-01-18T00:00:00Z' },
  { _id: 'm4', customerName: 'Suresh Nair', rating: 4, comment: "Great atmosphere and friendly staff. The biryani was exceptional — easily the best I've had. Will return.", createdAt: '2026-02-25T00:00:00Z' },
]

function StarRow({ rating, gold }: { rating: number; gold: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < rating ? gold : '#3a3a3a', fontSize: 16 }}>★</span>
      ))}
    </div>
  )
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function TestimonialsSection({ reviews, gold }: TestimonialsSectionProps) {
  const displayReviews = reviews.length > 0 ? reviews : MOCK_REVIEWS
  const [active, setActive] = useState(0)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const total = displayReviews.length
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 640
  const isTablet = windowWidth < 900

  function startAuto() {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => setActive(prev => (prev + 1) % total), 4000)
  }

  useEffect(() => {
    startAuto()
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [total])

  function handlePrev() { setActive(prev => (prev - 1 + total) % total); startAuto() }
  function handleNext() { setActive(prev => (prev + 1) % total); startAuto() }

  function getVisible(): number[] {
    if (isMobile) return [active]
    if (isTablet) {
      if (total <= 1) return [0]
      return [active, (active + 1) % total]
    }
    if (total <= 1) return [0]
    if (total === 2) return [active, (active + 1) % total]
    return [active, (active + 1) % total, (active + 2) % total]
  }

  const visible = getVisible()
  const gridCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'

  return (
    <section style={{ position: 'relative', width: '100%', padding: isMobile ? '56px 16px' : '96px 16px', overflow: 'hidden', background: '#080808' }}>
      {/* Decorative glow circles — clipped by section overflow:hidden */}
      <div style={{ position: 'absolute', top: -64, right: -64, width: isMobile ? 200 : 384, height: isMobile ? 200 : 384, borderRadius: '50%', background: gold, filter: 'blur(96px)', opacity: 0.05, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -64, left: -64, width: isMobile ? 200 : 384, height: isMobile ? 200 : 384, borderRadius: '50%', background: gold, filter: 'blur(96px)', opacity: 0.05, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1152, margin: '0 auto', position: 'relative' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} viewport={{ once: true }}
            style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 100, border: `1px solid ${gold}`, color: gold, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}
          >
            ✦ GUEST REVIEWS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} viewport={{ once: true }}
            style={{ color: '#ffffff', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, margin: 0 }}
          >
            What Our Guests Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.16 }} viewport={{ once: true }}
            style={{ color: '#a3a3a3', fontSize: 14, marginTop: 12 }}
          >
            Trusted by hundreds of happy diners
          </motion.p>
        </div>

        {/* Cards grid — responsive */}
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isMobile ? 16 : 20 }}>
          {visible.map((idx, position) => {
            const review = displayReviews[idx]
            return (
              <motion.div
                key={`${idx}-${position}`}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.45, delay: position * 0.07 }}
                style={{ background: '#141414', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden', borderTop: `3px solid ${gold}` }}
              >
                {/* Inner glow line */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: `linear-gradient(90deg, ${gold}, transparent)`, opacity: 0.4 }} />

                {/* Big quote mark */}
                <div style={{ color: gold, fontSize: 64, lineHeight: 1, opacity: 0.2, marginBottom: -12, fontFamily: 'serif', userSelect: 'none' }}>&ldquo;</div>

                {/* Review text */}
                <p style={{ color: '#e0e0e0', fontSize: 14, lineHeight: 1.7, fontStyle: 'italic', flex: 1, margin: 0 }}>
                  {review.comment || 'Great dining experience. Highly recommended!'}
                </p>

                {/* Stars */}
                <StarRow rating={review.rating} gold={gold} />

                {/* Customer info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 14, borderTop: '1px solid #2a2a2a' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${gold}, #b8860b)`, color: '#000', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {(review.customerName ?? 'G')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#ffffff', fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {review.customerName || 'Guest'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                      <span style={{ background: gold + '22', color: gold, fontSize: 11, padding: '2px 8px', borderRadius: 100, fontWeight: 500 }}>Verified Customer</span>
                      {review.createdAt && <span style={{ color: '#737373', fontSize: 12 }}>{formatDate(review.createdAt)}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Prev / Next arrows + dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 40 }}>
          <button
            onClick={handlePrev}
            style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${gold}55`, color: gold, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {displayReviews.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); startAuto() }}
                style={{ width: i === active ? 24 : 8, height: 8, borderRadius: 4, background: i === active ? gold : '#333', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${gold}55`, color: gold, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT 4: FAQSection
// ═══════════════════════════════════════════════════════════════════════════════

export function FAQSection({ restaurant, gold }: { restaurant: Restaurant; gold: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const faqs = [
    { q: `Does ${restaurant.name} offer home delivery?`, a: 'Yes! We offer fast home delivery. Place your order online and get it delivered hot to your doorstep.' },
    { q: 'Can I book a table in advance?', a: 'Absolutely! Use our online table booking system to reserve your spot. Choose your date, time, and number of guests.' },
    { q: 'What are your opening hours?', a: `We are open ${restaurant.openingTime || '12:00 PM'} to ${restaurant.closingTime || '11:00 PM'} daily. We look forward to serving you!` },
    { q: 'Do you have vegetarian options?', a: 'Yes! We have a wide variety of vegetarian dishes clearly marked on our menu. Vegan options available on request.' },
    { q: 'How can I contact you for bulk orders?', a: `Call us at ${restaurant.phone || 'the number listed on our contact page'} for bulk orders, catering, and special events.` },
    { q: 'Are there any ongoing offers or discounts?', a: 'Check our "Hot Deals" section for daily offers and discounts. Subscribe to our newsletter for exclusive deals.' },
  ]

  return (
    <section style={{ background: '#050505', padding: '80px 16px' }}>
      {/* JSON-LD for FAQ schema - injected as data attribute for SEO */}
      <div
        data-faq-schema={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        })}
        style={{ display: 'none' }}
      />
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ color: gold, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            ✦ COMMON QUESTIONS
          </span>
          <h2 style={{ color: '#ffffff', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, margin: '12px 0 0' }}>
            Frequently Asked Questions
          </h2>
        </div>
        {/* Accordion */}
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            style={{
              borderBottom: `1px solid #1e1e1e`,
              overflow: 'hidden',
              marginBottom: 4,
            }}
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{
                width: '100%', textAlign: 'left', background: openIdx === i ? '#111' : 'transparent',
                border: 'none', padding: '18px 20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                borderLeft: openIdx === i ? `3px solid ${gold}` : '3px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ color: '#f0f0f0', fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{faq.q}</span>
              <motion.span
                animate={{ rotate: openIdx === i ? 45 : 0 }}
                style={{ color: gold, fontSize: 22, flexShrink: 0, fontWeight: 300 }}
              >+</motion.span>
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                  style={{ padding: '0 20px 18px 23px', background: '#111' }}
                >
                  <p style={{ color: '#a3a3a3', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
