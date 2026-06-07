'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, ArrowRight, CheckCircle } from 'lucide-react';

interface FormData {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  occasion: string;
}

const initialFormData: FormData = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: '',
  occasion: '',
};

const timeSlots = [
  '12:00 PM', '1:00 PM', '2:00 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
];

const occasions = [
  'Birthday', 'Anniversary', 'Business Lunch',
  'Date Night', 'Family Gathering', 'Other',
];

const baseInputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#1f1f1f',
  border: '1px solid rgba(200,151,42,0.2)',
  borderRadius: '12px',
  padding: '12px 14px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'var(--rb-text2)',
  fontSize: '12px',
  fontWeight: 600,
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

function FocusInput({
  type, name, placeholder, value, onChange,
}: {
  type: string; name: string; placeholder?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [isFocused, setFocused] = useState(false);
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...baseInputStyle,
        borderColor: isFocused ? '#c8972a' : 'rgba(200,151,42,0.2)',
        colorScheme: type === 'date' ? 'dark' : undefined,
      }}
    />
  );
}

function FocusSelect({
  name, value, onChange, children, required,
}: {
  name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode; required?: boolean;
}) {
  const [isFocused, setFocused] = useState(false);
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...baseInputStyle,
        borderColor: isFocused ? '#c8972a' : 'rgba(200,151,42,0.2)',
        cursor: 'pointer',
        appearance: 'none',
      }}
    >
      {children}
    </select>
  );
}

const RESTAURANT_SLUG = process.env.NEXT_PUBLIC_RESTAURANT_SLUG || 'spice-garden';

export default function BookingSection() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    const timeMap: Record<string, string> = {
      '12:00 PM': '12:00', '1:00 PM': '13:00', '2:00 PM': '14:00',
      '7:00 PM': '19:00', '7:30 PM': '19:30', '8:00 PM': '20:00',
      '8:30 PM': '20:30', '9:00 PM': '21:00', '9:30 PM': '21:30',
    };
    const time24 = timeMap[formData.time] || '';
    const params = new URLSearchParams({ restaurant: RESTAURANT_SLUG });
    if (formData.date) params.set('date', formData.date);
    if (time24) params.set('time', time24);
    if (formData.guests) params.set('guests', formData.guests);
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <section
      id="book-table"
      style={{ backgroundColor: 'var(--rb-bg)', padding: '80px 0' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div
          className="booking-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* ── LEFT SIDE ── */}
          <div
            style={{
              position: 'relative',
              minHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Background image */}
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=90&fit=crop"
              alt="Elegant candlelit restaurant interior"
              fill
              unoptimized
              style={{ objectFit: 'cover', zIndex: 0 }}
            />

            {/* Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(10,6,0,0.72)',
                zIndex: 1,
              }}
            />

            {/* Content */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                padding: '48px 44px',
              }}
            >
              {/* Top */}
              <div>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  style={{
                    color: '#c8972a',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '14px',
                    margin: '0 0 14px',
                  }}
                >
                  Table Reservations
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: 0.1 }}
                  style={{
                    color: '#f0c060',
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontStyle: 'italic',
                    fontSize: 'clamp(36px, 4vw, 52px)',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    margin: '0 0 18px',
                  }}
                >
                  Dine With Us
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: 0.18 }}
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: '15px',
                    lineHeight: 1.65,
                    margin: '0',
                    maxWidth: '340px',
                  }}
                >
                  Reserve your perfect evening. Every visit is an experience
                  crafted just for you.
                </motion.p>
              </div>

              {/* Middle: bullets */}
              <motion.ul
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.32 }}
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {[
                  'Private dining available',
                  'Complimentary welcome drink',
                  'Personalized service, every time',
                ].map((feat) => (
                  <li
                    key={feat}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <span style={{ color: '#c8972a', fontSize: '16px', lineHeight: 1 }}>✓</span>
                    <span
                      style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </motion.ul>

              {/* Bottom: phone */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.46 }}
              >
                <p style={{ color: 'var(--rb-text2)', fontSize: '14px', margin: 0 }}>
                  📞{' '}
                  <span style={{ color: '#f0c060', fontWeight: 600 }}>Or call us:</span>{' '}
                  +91 98765 43210
                </p>
              </motion.div>
            </div>
          </div>

          {/* ── RIGHT SIDE ── */}
          <div
            style={{
              backgroundColor: 'var(--rb-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '18px',
                  padding: '40px 20px',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(76,175,80,0.12)',
                    border: '2px solid #4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle size={40} color="#4caf50" />
                </div>

                <h3
                  style={{
                    color: 'var(--rb-text)',
                    fontSize: '26px',
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  Table Reserved! 🎉
                </h3>

                <p
                  style={{
                    color: 'var(--rb-text2)',
                    fontSize: '15px',
                    lineHeight: 1.65,
                    margin: 0,
                    maxWidth: '280px',
                  }}
                >
                  Your reservation has been confirmed. We look forward to
                  welcoming you for an unforgettable evening.
                </p>

                <p style={{ color: '#c8972a', fontSize: '13px', margin: 0 }}>
                  Confirmation sent via WhatsApp &amp; Email
                </p>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData(initialFormData);
                  }}
                  style={{
                    marginTop: '6px',
                    background: 'transparent',
                    border: '1.5px solid rgba(200,151,42,0.35)',
                    borderRadius: '10px',
                    color: '#f0c060',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '10px 26px',
                    cursor: 'pointer',
                  }}
                >
                  Book Another Table
                </button>
              </motion.div>
            ) : (
              <motion.form
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                onSubmit={handleSubmit}
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                {/* Form title */}
                <motion.div
                  variants={itemVariants}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}
                >
                  <Calendar size={20} color="#c8972a" />
                  <h3 style={{ color: 'var(--rb-text)', fontSize: '22px', fontWeight: 800, margin: 0 }}>
                    Book a Table
                  </h3>
                </motion.div>

                {/* Name */}
                <motion.div variants={itemVariants}>
                  <label style={labelStyle}>Full Name</label>
                  <FocusInput
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </motion.div>

                {/* Phone */}
                <motion.div variants={itemVariants}>
                  <label style={labelStyle}>Phone Number</label>
                  <FocusInput
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </motion.div>

                {/* Date + Time */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '14px',
                  }}
                >
                  <motion.div variants={itemVariants}>
                    <label style={labelStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={10} /> Date
                      </span>
                    </label>
                    <FocusInput
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label style={labelStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> Time
                      </span>
                    </label>
                    <FocusSelect
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled style={{ color: '#666' }}>
                        Select time
                      </option>
                      {timeSlots.map((t) => (
                        <option key={t} value={t} style={{ backgroundColor: '#1f1f1f' }}>
                          {t}
                        </option>
                      ))}
                    </FocusSelect>
                  </motion.div>
                </div>

                {/* Guests */}
                <motion.div variants={itemVariants}>
                  <label style={labelStyle}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={10} /> Number of Guests
                    </span>
                  </label>
                  <FocusSelect
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled style={{ color: '#666' }}>
                      Select guests
                    </option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option
                        key={n}
                        value={String(n)}
                        style={{ backgroundColor: '#1f1f1f' }}
                      >
                        {n === 1 ? '1 Guest' : `${n} Guests`}
                      </option>
                    ))}
                  </FocusSelect>
                </motion.div>

                {/* Occasion */}
                <motion.div variants={itemVariants}>
                  <label style={labelStyle}>Occasion</label>
                  <FocusSelect
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleChange}
                  >
                    <option value="" style={{ color: '#666' }}>
                      Select occasion
                    </option>
                    {occasions.map((o) => (
                      <option key={o} value={o} style={{ backgroundColor: '#1f1f1f' }}>
                        {o}
                      </option>
                    ))}
                  </FocusSelect>
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="button"
                    onClick={handleSubmit as any}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 10px 36px rgba(240,192,96,0.55)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '15px',
                      background: 'linear-gradient(135deg, #8b5a00 0%, #c8972a 50%, #f0c060 100%)',
                      color: '#080808',
                      boxShadow: '0 6px 24px rgba(200,151,42,0.4)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                    }}
                  >
                    Reserve My Table →
                    <ArrowRight size={17} strokeWidth={2.5} />
                  </motion.button>

                  <p
                    style={{
                      color: 'var(--rb-text3)',
                      fontSize: '12px',
                      textAlign: 'center',
                      margin: '10px 0 0',
                    }}
                  >
                    Confirmation sent via WhatsApp &amp; Email
                  </p>
                </motion.div>
              </motion.form>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
