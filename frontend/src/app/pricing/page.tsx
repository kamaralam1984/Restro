'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Check, X, Star, Zap, Crown, Rocket, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Plan {
  _id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  trialDays: number;
  isPopular: boolean;
  description: string;
  badge?: string;
  icon?: string;
  buttonLabel?: string;
  features: {
    menuItems: number | string;
    staffMembers: number | string;
    tables: number | string;
    onlineOrders: boolean;
    tableBooking: boolean;
    billingGST: boolean;
    analytics: boolean;
    staffRoleControl: boolean;
    whatsappIntegration: boolean;
    customDomain: boolean;
    prioritySupport: boolean;
  };
}

// ─── Fallback Plans ──────────────────────────────────────────────────────────

const FALLBACK_PLANS: Plan[] = [
  {
    _id: 'demo',
    name: 'Demo',
    price: 0,
    yearlyPrice: 0,
    trialDays: 3,
    isPopular: false,
    description: '3-day free demo. No credit card required.',
    badge: 'FREE 3 DAYS',
    icon: 'Rocket',
    buttonLabel: 'Start Free Demo',
    features: {
      menuItems: 20,
      staffMembers: 2,
      tables: 5,
      onlineOrders: true,
      tableBooking: true,
      billingGST: true,
      analytics: false,
      staffRoleControl: false,
      whatsappIntegration: false,
      customDomain: false,
      prioritySupport: false,
    },
  },
  {
    _id: 'basic',
    name: 'Basic',
    price: 1999,
    yearlyPrice: 19990,
    trialDays: 7,
    isPopular: false,
    description: 'Perfect for small restaurants just getting started.',
    badge: undefined,
    icon: 'Zap',
    buttonLabel: 'Start 7-Day Trial',
    features: {
      menuItems: 50,
      staffMembers: 3,
      tables: 10,
      onlineOrders: true,
      tableBooking: false,
      billingGST: true,
      analytics: false,
      staffRoleControl: false,
      whatsappIntegration: false,
      customDomain: false,
      prioritySupport: false,
    },
  },
  {
    _id: 'pro',
    name: 'Pro',
    price: 3999,
    yearlyPrice: 39990,
    trialDays: 7,
    isPopular: true,
    description: 'For growing restaurants that need more power.',
    badge: 'MOST POPULAR',
    icon: 'Star',
    buttonLabel: 'Start 7-Day Trial',
    features: {
      menuItems: 200,
      staffMembers: 10,
      tables: 30,
      onlineOrders: true,
      tableBooking: true,
      billingGST: true,
      analytics: true,
      staffRoleControl: true,
      whatsappIntegration: true,
      customDomain: false,
      prioritySupport: false,
    },
  },
  {
    _id: 'premium',
    name: 'Premium',
    price: 6999,
    yearlyPrice: 69990,
    trialDays: 14,
    isPopular: false,
    description: 'For restaurant chains and premium establishments.',
    badge: undefined,
    icon: 'Crown',
    buttonLabel: 'Start 14-Day Trial',
    features: {
      menuItems: 'Unlimited',
      staffMembers: 'Unlimited',
      tables: 'Unlimited',
      onlineOrders: true,
      tableBooking: true,
      billingGST: true,
      analytics: true,
      staffRoleControl: true,
      whatsappIntegration: true,
      customDomain: true,
      prioritySupport: true,
    },
  },
];

// ─── Feature comparison rows ─────────────────────────────────────────────────

const FEATURE_ROWS = [
  { key: 'menuItems', label: 'Menu Items' },
  { key: 'staffMembers', label: 'Staff Members' },
  { key: 'tables', label: 'Tables' },
  { key: 'onlineOrders', label: 'Online Orders' },
  { key: 'tableBooking', label: 'Table Booking' },
  { key: 'billingGST', label: 'Billing & GST' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'staffRoleControl', label: 'Staff Role Control' },
  { key: 'whatsappIntegration', label: 'WhatsApp Integration' },
  { key: 'customDomain', label: 'Custom Domain' },
  { key: 'prioritySupport', label: 'Priority Support' },
];

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: 'Kya credit card chahiye demo ke liye?',
    answer: 'Nahi, Demo plan bilkul free hai. Koi credit card nahi chahiye. Sirf apna email aur restaurant ka naam daalein aur shuru ho jaayein.',
  },
  {
    question: 'Demo ke baad kya hoga?',
    answer: '3 din baad aapka account suspend ho jaega. Aap kisi bhi paid plan me upgrade kar sakte hain aur aapka saara data safe rahega.',
  },
  {
    question: 'Kya yearly plan me refund milta hai?',
    answer: 'Haan, 30 din ke andar full refund milta hai — koi sawaal nahi. Aapki satisfaction hamare liye sabse important hai.',
  },
  {
    question: 'Ek se zyada restaurant manage kar sakte hain?',
    answer: 'Premium plan me multiple branches support hai. Ek hi dashboard se apni saari locations manage karein.',
  },
];

// ─── Icon helper ─────────────────────────────────────────────────────────────

function PlanIcon({ iconName, size = 22 }: { iconName?: string; size?: number }) {
  const style = { width: size, height: size };
  if (iconName === 'Crown') return <Crown style={style} />;
  if (iconName === 'Star') return <Star style={style} />;
  if (iconName === 'Zap') return <Zap style={style} />;
  return <Rocket style={style} />;
}

// ─── Colours ─────────────────────────────────────────────────────────────────

const GOLD = '#c8972a';
const GOLD_LIGHT = '#e8b84b';
const BG = '#080808';
const SURFACE = '#141414';
const SURFACE2 = '#1a1a1a';
const BORDER = 'rgba(200,151,42,0.15)';
const BORDER_GOLD = 'rgba(200,151,42,0.6)';
const TEXT_MUTED = '#a89070';
const TEXT_WHITE = '#ffffff';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch plans from API and merge with fallback
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${API}/restaurants/plans`)
      .then((r) => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        // Normalize API features (maxMenuItems → menuItems etc.) then merge with fallback
        const merged = FALLBACK_PLANS.map((fp) => {
          const apiPlan = data.find(
            (p) => p.name?.toLowerCase() === fp.name.toLowerCase()
          );
          if (!apiPlan) return fp;
          const f = apiPlan.features ?? {};
          const normalizedFeatures: Plan['features'] = {
            menuItems: f.maxMenuItems === -1 ? 'Unlimited' : (f.maxMenuItems ?? fp.features.menuItems),
            staffMembers: f.maxStaff === -1 ? 'Unlimited' : (f.maxStaff ?? fp.features.staffMembers),
            tables: f.maxTables === -1 ? 'Unlimited' : (f.maxTables ?? fp.features.tables),
            onlineOrders: f.onlineOrdering ?? fp.features.onlineOrders,
            tableBooking: f.tableBooking ?? fp.features.tableBooking,
            billingGST: f.billing ?? fp.features.billingGST,
            analytics: f.analytics ?? fp.features.analytics,
            staffRoleControl: f.staffControl ?? fp.features.staffRoleControl,
            whatsappIntegration: f.whatsappIntegration ?? fp.features.whatsappIntegration,
            customDomain: f.customDomain ?? fp.features.customDomain,
            prioritySupport: fp.features.prioritySupport,
          };
          return { ...fp, _id: apiPlan._id, price: apiPlan.price, yearlyPrice: apiPlan.yearlyPrice ?? fp.yearlyPrice, trialDays: apiPlan.trialDays ?? fp.trialDays, features: normalizedFeatures };
        });
        setPlans(merged);
      })
      .catch(() => {
        // Keep fallback silently
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, [loading]);

  const getDisplayPrice = (plan: Plan) => {
    if (plan.price === 0) return { main: '₹0', sub: '3 days free' };
    if (billing === 'yearly') {
      return {
        main: `₹${plan.yearlyPrice.toLocaleString('en-IN')}`,
        sub: '/year',
      };
    }
    return {
      main: `₹${plan.price.toLocaleString('en-IN')}`,
      sub: '/month',
    };
  };

  const getHref = (plan: Plan) =>
    `/restaurant/signup?plan=${plan._id}&billing=${billing}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: TEXT_WHITE,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Hero / Title ──────────────────────────────────────────────── */}
      <section
        style={{
          textAlign: 'center',
          padding: '80px 24px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(200,151,42,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(200,151,42,0.1)',
              border: `1px solid ${BORDER_GOLD}`,
              color: GOLD,
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '2px',
              padding: '6px 16px',
              borderRadius: '100px',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}
          >
            Pricing Plans
          </span>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.15,
              margin: '0 0 16px',
              letterSpacing: '-1px',
            }}
          >
            Simple,{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Transparent
            </span>{' '}
            Pricing
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: TEXT_MUTED,
              maxWidth: '520px',
              margin: '0 auto 40px',
              lineHeight: 1.6,
            }}
          >
            Apne restaurant ke liye sahi plan chunein. Free demo se shuru karein,
            kabhi bhi upgrade karein.
          </p>

          {/* ── Monthly / Yearly toggle ──────────────────────────── */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: '100px',
              padding: '6px',
            }}
          >
            {(['monthly', 'yearly'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBilling(mode)}
                style={{
                  padding: '8px 22px',
                  borderRadius: '100px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.25s ease',
                  background:
                    billing === mode
                      ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`
                      : 'transparent',
                  color: billing === mode ? '#000' : TEXT_MUTED,
                  position: 'relative',
                }}
              >
                {mode === 'monthly' ? 'Monthly' : 'Yearly'}
                {mode === 'yearly' && (
                  <AnimatePresence>
                    {billing === 'yearly' && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '-8px',
                          background: '#22c55e',
                          color: '#fff',
                          fontSize: '9px',
                          fontWeight: 800,
                          letterSpacing: '0.5px',
                          padding: '2px 6px',
                          borderRadius: '100px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        SAVE 17%
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Plan Cards ───────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
        }}
      >
        {plans.map((plan, i) => {
          const isDemo = plan._id === 'demo';
          const isPro = plan.isPopular;
          const price = getDisplayPrice(plan);

          const cardBorder = isPro
            ? `1.5px solid ${GOLD}`
            : isDemo
            ? `1.5px dashed ${BORDER_GOLD}`
            : `1px solid ${BORDER}`;

          const cardShadow = isPro
            ? `0 0 40px rgba(200,151,42,0.2), 0 8px 32px rgba(0,0,0,0.6)`
            : `0 4px 24px rgba(0,0,0,0.4)`;

          return (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                position: 'relative',
                background: isPro ? 'rgba(200,151,42,0.05)' : SURFACE,
                border: cardBorder,
                borderRadius: '16px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: cardShadow,
                transform: isPro ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {/* Badge ribbon */}
              {plan.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    right: '20px',
                    background: isPro
                      ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`
                      : isDemo
                      ? 'transparent'
                      : '#6366f1',
                    border: isDemo ? `1px dashed ${GOLD}` : 'none',
                    color: isDemo ? GOLD : '#000',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    padding: '5px 12px',
                    borderRadius: '0 0 8px 8px',
                    textTransform: 'uppercase',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Icon */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: isPro
                    ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`
                    : 'rgba(200,151,42,0.1)',
                  border: isPro ? 'none' : `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isPro ? '#000' : GOLD,
                  marginBottom: '20px',
                }}
              >
                <PlanIcon iconName={plan.icon} />
              </div>

              {/* Name & description */}
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '0 0 6px',
                  color: TEXT_WHITE,
                }}
              >
                {plan.name}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: TEXT_MUTED,
                  margin: '0 0 24px',
                  lineHeight: 1.5,
                }}
              >
                {plan.description}
              </p>

              {/* Price */}
              <div style={{ marginBottom: '28px' }}>
                <span
                  style={{
                    fontSize: 'clamp(28px, 4vw, 38px)',
                    fontWeight: 800,
                    color: isPro ? GOLD_LIGHT : TEXT_WHITE,
                    letterSpacing: '-1px',
                  }}
                >
                  {price.main}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    color: TEXT_MUTED,
                    marginLeft: '4px',
                  }}
                >
                  {price.sub}
                </span>
                {billing === 'yearly' && plan.price > 0 && (
                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '12px',
                      color: '#22c55e',
                      fontWeight: 600,
                    }}
                  >
                    Save ₹{((plan.price * 12) - plan.yearlyPrice).toLocaleString('en-IN')} vs monthly
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <Link
                href={getHref(plan)}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '13px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                  marginBottom: '28px',
                  transition: 'all 0.25s ease',
                  ...(isPro
                    ? {
                        background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                        color: '#000',
                        boxShadow: `0 4px 20px rgba(200,151,42,0.35)`,
                      }
                    : isDemo
                    ? {
                        background: 'transparent',
                        color: GOLD,
                        border: `1.5px solid ${GOLD}`,
                      }
                    : {
                        background: SURFACE2,
                        color: TEXT_WHITE,
                        border: `1px solid ${BORDER}`,
                      }),
                }}
              >
                {plan.buttonLabel || 'Get Started'}
              </Link>

              {/* Feature highlights */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                {[
                  `${plan.features.menuItems} Menu Items`,
                  `${plan.features.staffMembers} Staff Members`,
                  `${plan.features.tables} Tables`,
                  plan.features.onlineOrders && 'Online Orders',
                  plan.features.tableBooking && 'Table Booking',
                  plan.features.billingGST && 'Billing & GST',
                  plan.features.analytics && 'Analytics Dashboard',
                  plan.features.whatsappIntegration && 'WhatsApp Integration',
                  plan.features.customDomain && 'Custom Domain',
                  plan.features.prioritySupport && 'Priority Support',
                ]
                  .filter(Boolean)
                  .map((feat, fi) => (
                    <li
                      key={fi}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        color: TEXT_MUTED,
                        marginBottom: '10px',
                      }}
                    >
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'rgba(200,151,42,0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Check
                          style={{ width: 11, height: 11, color: GOLD }}
                          strokeWidth={3}
                        />
                      </span>
                      {feat}
                    </li>
                  ))}
              </ul>
            </motion.div>
          );
        })}
      </section>

      {/* ── Feature Comparison Table ──────────────────────────────────── */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 800,
              margin: '0 0 8px',
              letterSpacing: '-0.5px',
            }}
          >
            Full Feature{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Comparison
            </span>
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: TEXT_MUTED,
              fontSize: '15px',
              marginBottom: '40px',
            }}
          >
            Apne restaurant ki zaroorat ke hisaab se plan chunein
          </p>

          <div
            style={{
              overflowX: 'auto',
              borderRadius: '16px',
              border: `1px solid ${BORDER}`,
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '640px',
              }}
            >
              <thead>
                <tr style={{ background: SURFACE }}>
                  <th
                    style={{
                      padding: '18px 24px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: TEXT_MUTED,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan._id}
                      style={{
                        padding: '18px 16px',
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: 700,
                        borderBottom: `1px solid ${BORDER}`,
                        color: plan.isPopular ? GOLD : TEXT_WHITE,
                        background: plan.isPopular
                          ? 'rgba(200,151,42,0.05)'
                          : 'transparent',
                      }}
                    >
                      {plan.name}
                      {plan.isPopular && (
                        <div
                          style={{
                            fontSize: '9px',
                            color: GOLD,
                            fontWeight: 800,
                            letterSpacing: '1px',
                            marginTop: '2px',
                          }}
                        >
                          ★ POPULAR
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, ri) => {
                  const isEven = ri % 2 === 0;
                  return (
                    <tr
                      key={row.key}
                      style={{
                        background: isEven ? 'transparent' : 'rgba(255,255,255,0.015)',
                      }}
                    >
                      <td
                        style={{
                          padding: '14px 24px',
                          fontSize: '14px',
                          color: TEXT_MUTED,
                          borderBottom:
                            ri < FEATURE_ROWS.length - 1
                              ? `1px solid rgba(255,255,255,0.04)`
                              : 'none',
                        }}
                      >
                        {row.label}
                      </td>
                      {plans.map((plan) => {
                        const val =
                          plan.features[row.key as keyof Plan['features']];
                        const isPlanPro = plan.isPopular;
                        const bg = isPlanPro
                          ? 'rgba(200,151,42,0.03)'
                          : 'transparent';

                        return (
                          <td
                            key={plan._id}
                            style={{
                              padding: '14px 16px',
                              textAlign: 'center',
                              background: bg,
                              borderBottom:
                                ri < FEATURE_ROWS.length - 1
                                  ? `1px solid rgba(255,255,255,0.04)`
                                  : 'none',
                            }}
                          >
                            {typeof val === 'boolean' ? (
                              val ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    background: 'rgba(34,197,94,0.12)',
                                  }}
                                >
                                  <Check
                                    style={{
                                      width: 13,
                                      height: 13,
                                      color: '#22c55e',
                                    }}
                                    strokeWidth={3}
                                  />
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    background: 'rgba(239,68,68,0.1)',
                                  }}
                                >
                                  <X
                                    style={{
                                      width: 13,
                                      height: 13,
                                      color: '#ef4444',
                                    }}
                                    strokeWidth={3}
                                  />
                                </span>
                              )
                            ) : (
                              <span
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color: isPlanPro ? GOLD_LIGHT : TEXT_WHITE,
                                }}
                              >
                                {val}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* CTA row */}
                <tr style={{ background: SURFACE }}>
                  <td style={{ padding: '20px 24px' }} />
                  {plans.map((plan) => (
                    <td
                      key={plan._id}
                      style={{
                        padding: '20px 16px',
                        textAlign: 'center',
                        background: plan.isPopular
                          ? 'rgba(200,151,42,0.05)'
                          : 'transparent',
                      }}
                    >
                      <Link
                        href={getHref(plan)}
                        style={{
                          display: 'inline-block',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '12px',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          ...(plan.isPopular
                            ? {
                                background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                                color: '#000',
                              }
                            : plan._id === 'demo'
                            ? {
                                background: 'transparent',
                                color: GOLD,
                                border: `1px solid ${GOLD}`,
                              }
                            : {
                                background: SURFACE2,
                                color: TEXT_WHITE,
                                border: `1px solid ${BORDER}`,
                              }),
                        }}
                      >
                        {plan.buttonLabel || 'Get Started'}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 24px 100px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 800,
              margin: '0 0 8px',
              letterSpacing: '-0.5px',
            }}
          >
            Frequently Asked{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Questions
            </span>
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: TEXT_MUTED,
              fontSize: '15px',
              marginBottom: '40px',
            }}
          >
            Aapke sawalaat ke jawab
          </p>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {FAQ_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                style={{
                  background: SURFACE,
                  border: `1px solid ${openFaq === i ? BORDER_GOLD : BORDER}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 0.25s ease',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: TEXT_WHITE,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.question}
                  </span>
                  <span style={{ color: GOLD, flexShrink: 0 }}>
                    {openFaq === i ? (
                      <ChevronUp style={{ width: 18, height: 18 }} />
                    ) : (
                      <ChevronDown style={{ width: 18, height: 18 }} />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p
                        style={{
                          margin: '0',
                          padding: '0 24px 20px',
                          fontSize: '14px',
                          color: TEXT_MUTED,
                          lineHeight: 1.7,
                        }}
                      >
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer CTA Strip ─────────────────────────────────────────── */}
      <section
        style={{
          background: SURFACE,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          padding: '56px 24px',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3
            style={{
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 800,
              margin: '0 0 12px',
            }}
          >
            Abhi shuru karein — bilkul free mein
          </h3>
          <p
            style={{
              color: TEXT_MUTED,
              fontSize: '15px',
              marginBottom: '28px',
            }}
          >
            3 din ka free demo, koi credit card nahi chahiye
          </p>
          <Link
            href="/restaurant/signup?plan=demo&billing=monthly"
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
              color: '#000',
              fontWeight: 800,
              fontSize: '15px',
              textDecoration: 'none',
              boxShadow: `0 4px 20px rgba(200,151,42,0.35)`,
              letterSpacing: '0.3px',
            }}
          >
            Free Demo Start Karein
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
