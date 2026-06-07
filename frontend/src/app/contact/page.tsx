'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Twitter, Linkedin, Youtube, ChevronDown, Zap, Shield, HeadphonesIcon, BarChart3, Calendar, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/services/api';


const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)',
  borderRadius: '12px', padding: '13px 16px', color: '#f8f4ed', fontSize: '15px',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};
const labelStyle: React.CSSProperties = {
  display: 'block', color: '#a89070', fontSize: '12px', fontWeight: 600,
  marginBottom: '7px', letterSpacing: '0.06em', textTransform: 'uppercase',
};

const INFO_CARDS = [
  {
    icon: MapPin, title: 'Visit Us',
    details: ['123 Main Street', 'City, State 12345', 'India'],
    accent: '#c8972a',
  },
  {
    icon: Phone, title: 'Call Us',
    details: ['+91 9942000413', '+91 9386994688', 'Mon–Sun: 9AM – 11PM'],
    accent: '#c8972a',
  },
  {
    icon: Mail, title: 'Email Us',
    details: ['info@restroos.com', 'support@restroos.com', 'reservations@restroos.com'],
    accent: '#c8972a',
  },
  {
    icon: Clock, title: 'Hours',
    details: ['Mon–Fri: 11AM – 10PM', 'Sat–Sun: 10AM – 11PM', 'Holidays: 12PM – 9PM'],
    accent: '#c8972a',
  },
];

const SOCIAL_LINKS = [
  { icon: Facebook, name: 'Facebook', url: '#', hoverBg: '#1877f2' },
  { icon: Instagram, name: 'Instagram', url: '#', hoverBg: '#e1306c' },
  { icon: Twitter, name: 'Twitter', url: '#', hoverBg: '#1da1f2' },
  { icon: Linkedin, name: 'LinkedIn', url: '#', hoverBg: '#0a66c2' },
  { icon: Youtube, name: 'YouTube', url: '#', hoverBg: '#ff0000' },
];

const FAQS = [
  {
    q: 'How do I get started with Restro OS?',
    a: 'Getting started is simple and takes less than 10 minutes. Sign up for a free trial, add your restaurant details, configure your menu, and you are ready to go. Our onboarding team is available via chat and phone to help you every step of the way — no technical experience required.',
  },
  {
    q: 'What kind of support do you offer after signup?',
    a: 'We provide 24/7 customer support via live chat, email, and phone for all paid plans. Our dedicated onboarding specialists guide you through setup, and our knowledge base has hundreds of tutorials and how-to articles. Premium plan users also get a personal account manager for priority assistance.',
  },
  {
    q: 'Can Restro OS integrate with my existing POS or billing system?',
    a: 'Yes, Restro OS supports integrations with popular POS systems, payment gateways like Razorpay and Stripe, accounting software, and third-party delivery platforms like Swiggy and Zomato. Our API is also open for custom integrations. Contact us and we will assess compatibility with your current setup.',
  },
  {
    q: 'Is my restaurant data secure on Restro OS?',
    a: 'Absolutely. We use bank-grade AES-256 encryption for all stored data and TLS 1.3 for data in transit. Our infrastructure is hosted on ISO 27001-certified servers with daily automated backups. We are fully GDPR and IT Act compliant, ensuring your customer and business data is always protected.',
  },
  {
    q: 'What happens if I want to cancel my subscription?',
    a: 'You can cancel your subscription at any time with no questions asked and no cancellation fees. Your data remains accessible for 30 days after cancellation, allowing you to export everything you need. We also offer a full refund within the first 14 days if Restro OS is not the right fit for your restaurant.',
  },
];

const WHY_CONTACT_CARDS = [
  {
    icon: Zap,
    title: 'Instant Demo Setup',
    desc: 'Book a personalised live demo in under 2 minutes. Our product experts will walk you through every feature tailored to your restaurant type — from QSR to fine dining — with no pressure and no obligation to buy.',
  },
  {
    icon: Shield,
    title: 'Dedicated Onboarding',
    desc: 'Our onboarding specialists ensure a smooth transition from day one. We help you import your menu, configure tables, train your staff, and go live without disrupting your daily operations.',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Expert Support',
    desc: 'Restaurant operations do not follow a 9-to-5 schedule, and neither do we. Reach our support team at any hour via chat, phone, or email. We resolve 95% of issues within the same day, guaranteed.',
  },
  {
    icon: BarChart3,
    title: 'Custom Growth Plans',
    desc: 'Every restaurant is unique. Contact us to get a pricing and feature plan built specifically around your outlet count, order volume, and growth goals. We offer flexible monthly and annual billing with no hidden charges.',
  },
];

function FaqItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.07 }}
      style={{ background: '#141414', border: `1px solid ${open ? 'rgba(200,151,42,0.35)' : 'rgba(200,151,42,0.12)'}`, borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s' }}
    >
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', background: 'none', border: 'none', padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '12px' }}>
        <span style={{ color: open ? '#f0c060' : '#f8f4ed', fontSize: '15px', fontWeight: 600, textAlign: 'left', transition: 'color 0.2s' }}>{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={18} color={open ? '#c8972a' : '#6b5040'} />
        </motion.div>
      </button>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
          style={{ padding: '0 22px 18px', color: '#a89070', fontSize: '14px', lineHeight: 1.7, borderTop: '1px solid rgba(200,151,42,0.1)' }}>
          {faq.a}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', formData);
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f8f4ed' }}>
      {mounted && (
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1c1c1c', color: '#f8f4ed', border: '1px solid rgba(200,151,42,0.25)', borderRadius: '12px' },
        }} />
      )}

      {/* ── Book a Demo Banner ── */}
      <section style={{ background: 'linear-gradient(135deg, #0f0a00 0%, #1a1000 50%, #0f0a00 100%)', borderBottom: '1px solid rgba(200,151,42,0.2)', padding: '28px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }} className="demo-banner-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(200,151,42,0.1)', border: '1px solid rgba(200,151,42,0.25)', borderRadius: '100px', padding: '6px 16px' }}>
            <Calendar size={14} color="#c8972a" />
            <span style={{ color: '#c8972a', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Free Demo Available</span>
          </div>
          <div>
            <h2 style={{ color: '#f8f4ed', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, margin: '0 0 8px' }}>
              Ready to Transform Your Restaurant?
            </h2>
            <p style={{ color: '#a89070', fontSize: '15px', margin: '0 0 18px', maxWidth: '560px' }}>
              See Restro OS live in action — a personalised 30-minute demo with one of our product experts. No commitment, completely free.
            </p>
          </div>
          <Link href="/demo">
            <motion.span
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(240,192,96,0.3)' }}
              whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)', color: '#080808', borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', textDecoration: 'none' }}
            >
              Book a Free Demo <ArrowRight size={16} />
            </motion.span>
          </Link>
        </div>
      </section>

      {/* ── Hero ── */}
      <section style={{ padding: '80px 20px 60px', background: 'linear-gradient(180deg, #0d0d0d 0%, #080808 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 600px 300px at 50% 0%, rgba(200,151,42,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: '680px', margin: '0 auto', position: 'relative' }}>
          <p style={{ color: '#c8972a', fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>GET IN TOUCH</p>
          <h1 style={{ fontSize: 'clamp(38px, 6vw, 60px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1 }}>
            We&apos;d Love to <span style={{ background: 'linear-gradient(135deg, #c8972a, #f0c060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hear From You</span>
          </h1>
          <p style={{ color: '#a89070', fontSize: '17px', lineHeight: 1.7, margin: 0 }}>
            Whether you have a question about features, pricing, need a demo, or just want to say hello — our team is ready to answer all your questions.
          </p>
        </motion.div>
      </section>

      {/* ── Info Cards ── */}
      <section style={{ padding: '60px 20px', background: '#080808' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
          {INFO_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(200,151,42,0.12)' }}
                style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)', borderRadius: '18px', padding: '26px', transition: 'box-shadow 0.2s, transform 0.2s' }}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(200,151,42,0.1)', border: '1px solid rgba(200,151,42,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                  <Icon size={22} color="#c8972a" />
                </div>
                <h3 style={{ color: '#f8f4ed', fontSize: '16px', fontWeight: 700, margin: '0 0 12px' }}>{card.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {card.details.map((d, j) => (
                    <li key={j} style={{ color: '#a89070', fontSize: '13px' }}>{d}</li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Why Contact Us ── */}
      <section style={{ padding: '60px 20px 70px', background: '#0d0d0d', borderTop: '1px solid rgba(200,151,42,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '44px' }}>
            <p style={{ color: '#c8972a', fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>REASONS TO REACH OUT</p>
            <h2 style={{ color: '#f8f4ed', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, margin: '0 0 14px' }}>Why Contact Restro OS?</h2>
            <p style={{ color: '#a89070', fontSize: '16px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
              Our team is more than a support desk — we are your long-term growth partners in restaurant technology.
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {WHY_CONTACT_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.09 }}
                  whileHover={{ y: -5, boxShadow: '0 16px 48px rgba(200,151,42,0.14)' }}
                  style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)', borderRadius: '18px', padding: '28px 24px', transition: 'box-shadow 0.25s, transform 0.25s' }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(139,90,0,0.25), rgba(200,151,42,0.18))', border: '1px solid rgba(200,151,42,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Icon size={24} color="#c8972a" />
                  </div>
                  <h3 style={{ color: '#f8f4ed', fontSize: '17px', fontWeight: 700, margin: '0 0 12px' }}>{card.title}</h3>
                  <p style={{ color: '#a89070', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Form + Map ── */}
      <section style={{ padding: '70px 20px', background: '#080808' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', alignItems: 'start' }} className="contact-grid">

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 style={{ color: '#f8f4ed', fontSize: '26px', fontWeight: 800, margin: '0 0 24px' }}>Send Us a Message</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelStyle}>Your Name *</label>
                <input type="text" required placeholder="John Doe" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#c8972a'} onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="contact-2col">
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input type="email" required placeholder="you@example.com" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#c8972a'} onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" placeholder="+91 99420 00413" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#c8972a'} onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Subject *</label>
                <input type="text" required placeholder="How can we help?" value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#c8972a'} onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'} />
              </div>

              <div>
                <label style={labelStyle}>Message *</label>
                <textarea required rows={6} placeholder="Tell us more about your inquiry…" value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                  onFocus={e => e.target.style.borderColor = '#c8972a'} onBlur={e => e.target.style.borderColor = 'rgba(200,151,42,0.2)'} />
              </div>

              <motion.button type="submit" disabled={loading}
                whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 32px rgba(240,192,96,0.35)' } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
                  width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: loading ? '#6b5040' : 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)',
                  color: '#080808', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(200,151,42,0.25)',
                }}>
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(8,8,8,0.3)', borderTopColor: '#080808', animation: 'spin 0.8s linear infinite' }} />
                    Sending…
                  </>
                ) : <><Send size={17} /> Send Message</>}
              </motion.button>
            </form>
          </motion.div>

          {/* Map + Quick Reasons */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ color: '#f8f4ed', fontSize: '26px', fontWeight: 800, margin: '0 0 18px' }}>Find Us</h2>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(200,151,42,0.18)', height: '300px' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184133389012!2d-73.98811768459398!3d40.75889597932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%" height="100%" style={{ border: 0, display: 'block' }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.15)', borderRadius: '16px', padding: '22px' }}>
              <h3 style={{ color: '#f8f4ed', fontSize: '16px', fontWeight: 700, margin: '0 0 16px' }}>Quick Reasons to Get in Touch</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Schedule a live product walkthrough',
                  'Get a custom pricing quote for your outlets',
                  'Report a technical issue or get urgent help',
                  'Learn about enterprise and multi-branch plans',
                  'Partner with us or explore API integrations',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#c8972a', fontSize: '16px', lineHeight: 1.4, flexShrink: 0 }}>✦</span>
                    <span style={{ color: '#a89070', fontSize: '14px', lineHeight: 1.5 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Location & Map Detail ── */}
      <section style={{ padding: '60px 20px', background: '#0d0d0d', borderTop: '1px solid rgba(200,151,42,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '36px' }}>
            <p style={{ color: '#c8972a', fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>OUR LOCATION</p>
            <h2 style={{ color: '#f8f4ed', fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 900, margin: '0 0 12px' }}>Where to Find Us</h2>
            <p style={{ color: '#a89070', fontSize: '15px', lineHeight: 1.7, maxWidth: '580px', margin: 0 }}>
              Restro OS is headquartered in India and serves restaurant operators across the country. Our support centres operate round the clock so you always have someone to call no matter your timezone or shift hours.
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '28px', alignItems: 'stretch' }} className="location-grid">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Headquarters', value: 'India — serving PAN-India restaurants' },
                { label: 'Support Hours', value: '24 hours a day, 7 days a week' },
                { label: 'Response Time', value: 'Under 2 hours for all support tickets' },
                { label: 'Languages', value: 'Hindi, English, Tamil, Telugu, Kannada' },
                { label: 'Onboarding', value: 'Remote setup, no travel required' },
              ].map((row, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  style={{ background: '#141414', border: '1px solid rgba(200,151,42,0.12)', borderRadius: '12px', padding: '16px 20px' }}>
                  <span style={{ color: '#c8972a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{row.label}</span>
                  <p style={{ color: '#f8f4ed', fontSize: '14px', margin: '5px 0 0', fontWeight: 500 }}>{row.value}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(200,151,42,0.18)', minHeight: '360px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #141414 0%, #1a1200 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(200,151,42,0.12)', border: '2px solid rgba(200,151,42,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={30} color="#c8972a" />
                </div>
                <h3 style={{ color: '#f8f4ed', fontSize: '20px', fontWeight: 800, margin: 0, textAlign: 'center' }}>Serving All of India</h3>
                <p style={{ color: '#a89070', fontSize: '14px', lineHeight: 1.7, textAlign: 'center', maxWidth: '340px', margin: 0 }}>
                  From Mumbai to Chennai, Delhi to Bangalore — Restro OS powers restaurants in every major city and tier-2 town across India. Our cloud-first platform means you can manage everything remotely, wherever you are.
                </p>
                <Link href="/demo">
                  <motion.span
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 22px', background: 'rgba(200,151,42,0.12)', border: '1px solid rgba(200,151,42,0.3)', color: '#f0c060', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}
                  >
                    Book a Demo Near You <ArrowRight size={14} />
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Social Media ── */}
      <section style={{ padding: '50px 20px', background: '#080808', borderTop: '1px solid rgba(200,151,42,0.08)', borderBottom: '1px solid rgba(200,151,42,0.08)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ color: '#f8f4ed', fontSize: '28px', fontWeight: 800, margin: '0 0 10px' }}>Follow Us</h2>
            <p style={{ color: '#a89070', fontSize: '15px', marginBottom: '30px' }}>
              Stay connected for the latest updates, special offers, and more.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {SOCIAL_LINKS.map((social, i) => {
                const Icon = social.icon;
                return (
                  <motion.a key={i} href={social.url} title={social.name}
                    whileHover={{ scale: 1.15, backgroundColor: social.hoverBg }}
                    whileTap={{ scale: 0.9 }}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#1c1c1c', border: '1px solid rgba(200,151,42,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background 0.2s' }}>
                    <Icon size={22} color="#c8972a" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '70px 20px 80px', background: '#080808' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: '#c8972a', fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>FAQ</p>
            <h2 style={{ color: '#f8f4ed', fontSize: '30px', fontWeight: 900, margin: '0 0 12px' }}>Frequently Asked Questions</h2>
            <p style={{ color: '#a89070', fontSize: '15px', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
              Got questions before reaching out? Here are the ones we hear most often from restaurant owners and managers like you.
            </p>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQS.map((faq, i) => <FaqItem key={i} faq={faq} index={i} />)}
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ marginTop: '40px', textAlign: 'center', background: '#141414', border: '1px solid rgba(200,151,42,0.15)', borderRadius: '18px', padding: '32px 24px' }}>
            <h3 style={{ color: '#f8f4ed', fontSize: '20px', fontWeight: 800, margin: '0 0 10px' }}>Still Have Questions?</h3>
            <p style={{ color: '#a89070', fontSize: '14px', lineHeight: 1.7, margin: '0 0 22px' }}>
              Our team is happy to walk you through anything. Book a live demo and get all your questions answered in real time.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/demo">
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 24px', background: 'linear-gradient(135deg, #8b5a00, #c8972a, #f0c060)', color: '#080808', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', textDecoration: 'none' }}>
                  Book a Demo <ArrowRight size={14} />
                </motion.span>
              </Link>
              <a href="mailto:support@restroos.com">
                <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 24px', background: 'transparent', border: '1px solid rgba(200,151,42,0.3)', color: '#c8972a', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
                  <Mail size={14} /> Email Support
                </motion.span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .contact-2col { grid-template-columns: 1fr !important; }
          .location-grid { grid-template-columns: 1fr !important; }
          .demo-banner-inner { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
