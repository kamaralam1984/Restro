import Link from 'next/link';

export const metadata = {
  title: "Our Story | Restro OS — India's Most Powerful Restaurant Management Platform",
  description:
    "Restro OS was built for India's restaurant owners — from the single-owner dhaba in Bihar to a multi-branch franchise in Mumbai. Read our brand story, mission, values, and the journey that led 500+ restaurants to trust us with ₹50 Cr+ in orders.",
  keywords: [
    'restaurant management software India',
    'restaurant OS',
    'POS system India',
    'restaurant billing software',
    'dhaba management system',
    'restaurant technology India',
    'Restro OS story',
    'about Restro OS',
  ],
  openGraph: {
    title: "Our Story | Restro OS — India's Most Powerful Restaurant Management Platform",
    description:
      'From a single frustrated restaurateur losing 3 hours daily, to the platform trusted by 500+ restaurants across 15 Indian states. This is our story.',
    type: 'website',
  },
};

// ── Data ────────────────────────────────────────────────────────────────────

const TIMELINE = [
  {
    year: '2023',
    title: 'The Beginning',
    body:
      'Restro OS was founded after our co-founder Arjun spent a year consulting with restaurant owners across Delhi, Patna, and Pune. He watched owners lose 3–4 hours every single day to manual billing, paper KOTs, and clunky spreadsheets. There was no integrated, affordable solution built for the Indian context. We decided to build one from scratch — designed for the chai shop in Varanasi and the fine-dine in Bengaluru alike.',
  },
  {
    year: '2024',
    title: 'First 50 Restaurants Onboarded',
    body:
      'Within 12 months of launch, 50 restaurants across Bihar, Uttar Pradesh, and Maharashtra had onboarded onto Restro OS. Together, they processed over ₹1 Crore in customer orders through our platform. The feedback was immediate — billing errors dropped, missed orders became rare, and owners finally had real-time visibility into their daily revenue. We knew we were onto something real.',
  },
  {
    year: '2025',
    title: 'Scaling Across India',
    body:
      'By mid-2025, Restro OS had expanded to 500+ active restaurants spanning 15 Indian states. From roadside dhabas in Jharkhand to cloud kitchens in Hyderabad and multi-outlet QSR chains in Mumbai, our platform handled everything — digital menus, QR ordering, live kitchen display, inventory tracking, and automated GST billing. Our customer success team grew to ensure every owner had a dedicated point of contact.',
  },
  {
    year: '2026',
    title: 'AI & Multi-Branch Era',
    body:
      'Today, Restro OS is at the frontier of restaurant intelligence. We launched AI-powered demand forecasting so owners can reduce food waste by up to 30%. Our multi-branch management console lets franchise operators monitor every outlet from a single dashboard — live sales, staff performance, and inventory — in real time. We also launched our Smart QR experience, letting guests browse, order, and pay entirely from their phone. The journey continues.',
  },
];

const VALUES = [
  {
    icon: '◈',
    title: 'Simplicity First',
    body:
      'Restaurant owners are experts in hospitality, not software. That is a truth we never forget. Every feature we design goes through a single test: can a first-time user learn it in under five minutes without reading a manual? If not, we go back to the drawing board. We have rejected features that were technically impressive but operationally confusing. Simplicity is not a design choice — it is a business commitment. When your waiter needs to place an order during the Friday dinner rush, they should never have to think twice about how the software works.',
  },
  {
    icon: '◉',
    title: 'Owner-First Design',
    body:
      'We talk to at least 20 restaurant owners every single month — not to sell them something, but to listen. We sit across from the owner of a small biryani shop in Lucknow and the operations head of a 30-outlet chain in Chennai, and we ask the same question: "What is the most frustrating part of your day?" Their answers drive every product decision we make. Our roadmap is not determined by what looks good in a demo. It is determined by what makes the person behind the counter breathe a little easier when the lunch rush hits.',
  },
  {
    icon: '◆',
    title: 'Reliability Always',
    body:
      'Your restaurant runs 12 to 16 hours a day. On weekends it might run 18. You cannot afford downtime — even 20 minutes of a crashed billing system during dinner service can cost you thousands of rupees and a table full of frustrated guests. We maintain 99.9% platform uptime, backed by redundant cloud infrastructure. Our on-call engineering team monitors the platform around the clock. When something does go wrong — because in technology something eventually does — our team responds within minutes, not hours. Your restaurant never stops. Neither do we.',
  },
  {
    icon: '◇',
    title: 'Transparent Pricing',
    body:
      'We built Restro OS for small and mid-sized restaurant owners, and we price it accordingly. There are no hidden fees, no per-transaction charges, no penalties for growing your business, and no surprise invoices at the end of the month. You pay one flat monthly subscription. That is it. We believe pricing should be something you can explain to your accountant in a single sentence. When you trust us with your business operations, the very least we can offer in return is complete financial transparency. No fine print. No gotchas.',
  },
];

const PAIN_POINTS = [
  {
    stat: '₹18,000+',
    label: 'lost monthly to billing errors',
    detail:
      'Manual billing — whether on paper or in a basic Excel sheet — introduces calculation mistakes, wrong GST computation, and duplicate entries. Most owners do not even know how much they are losing until they switch to automated billing.',
  },
  {
    stat: '12–15%',
    label: 'of orders miscommunicated to kitchen',
    detail:
      'Verbal order passing and handwritten KOTs create a broken telephone between the front of house and the kitchen. Missed modifications, wrong quantities, and forgotten items lead to food waste and guest complaints every single day.',
  },
  {
    stat: '₹8,000+',
    label: 'monthly in preventable food waste',
    detail:
      'Without inventory tracking, over-purchasing is the norm. Ingredients expire before use, portion sizes go unmonitored, and theft goes undetected. Smart inventory management can cut waste by 25–30% in the first three months.',
  },
  {
    stat: '2.5 hrs',
    label: 'lost daily to manual end-of-day reconciliation',
    detail:
      'Tallying cash, matching orders to payments, and manually preparing daily sales reports eats into the owner\'s personal time every night. An automated closing report should take 30 seconds — not two and a half hours.',
  },
  {
    stat: '0',
    label: 'data-driven decisions without analytics',
    detail:
      'Most restaurant owners operate on gut feeling because they have no historical data. Which dish is most profitable? What is the slowest hour? Which table turns over fastest? Without answers, pricing and staffing decisions cost money every week.',
  },
];

const NUMBERS = [
  { value: '500+', label: 'Active Restaurants' },
  { value: '15+', label: 'Indian States Covered' },
  { value: '2M+', label: 'Orders Processed' },
  { value: '₹50Cr+', label: 'Revenue Generated for Clients' },
];

// ── Styles ───────────────────────────────────────────────────────────────────

const gold = '#c8972a';
const goldLight = '#f0c060';
const bg1 = '#080808';
const bg2 = '#0d0d0d';
const textPrimary = '#f8f4ed';
const textMuted = '#a89070';
const border = 'rgba(200,151,42,0.12)';

// ── Component ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: bg1, color: textPrimary, fontFamily: 'inherit' }}>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section
        style={{
          padding: '100px 24px 90px',
          background: `linear-gradient(160deg, #0f0a00 0%, #0d0d0d 40%, ${bg1} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
          borderBottom: `1px solid ${border}`,
        }}
      >
        {/* warm radial glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(ellipse 900px 420px at 50% -10%, rgba(200,151,42,0.11) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative' }}>
          {/* eyebrow */}
          <p
            style={{
              color: gold,
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '18px',
              margin: '0 0 18px',
            }}
          >
            Our Story &nbsp;·&nbsp; Founded in India &nbsp;·&nbsp; Built for Indian Restaurants
          </p>

          {/* H1 */}
          <h1
            style={{
              fontSize: 'clamp(34px, 5.5vw, 68px)',
              fontWeight: 900,
              lineHeight: 1.08,
              margin: '0 0 28px',
              letterSpacing: '-0.02em',
            }}
          >
            The Story Behind{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${gold}, ${goldLight})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              India's Most Powerful
            </span>
            <br />
            Restaurant OS
          </h1>

          {/* lead paragraph */}
          <p
            style={{
              color: textMuted,
              fontSize: 'clamp(16px, 2vw, 19px)',
              lineHeight: 1.75,
              maxWidth: '640px',
              margin: '0 auto 0',
            }}
          >
            It started with one frustrated restaurant owner losing three hours every day to manual billing,
            missed orders, and handwritten KOTs. He was running a successful business, yet drowning in
            paperwork. We built Restro OS so that no restaurant owner in India ever has to feel that way again.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          OUR MISSION
      ════════════════════════════════════════ */}
      <section
        style={{
          padding: '88px 24px',
          background: bg2,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p
            style={{
              color: gold,
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Our Mission
          </p>

          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '0 0 32px',
              letterSpacing: '-0.01em',
            }}
          >
            Democratizing Restaurant Technology Across India
          </h2>

          {/* Mission pull quote */}
          <blockquote
            style={{
              margin: '0 0 36px',
              padding: '28px 32px',
              background: 'rgba(200,151,42,0.05)',
              borderLeft: `4px solid ${gold}`,
              borderRadius: '0 12px 12px 0',
            }}
          >
            <p
              style={{
                color: textPrimary,
                fontSize: 'clamp(17px, 2vw, 21px)',
                fontStyle: 'italic',
                lineHeight: 1.65,
                margin: 0,
                fontWeight: 500,
              }}
            >
              "We believe every restaurant owner deserves enterprise-grade tools — not just the big chains.
              Our mission is to democratize restaurant technology so that a single-owner dhaba in Bihar competes
              on the same digital footing as a franchise chain in Mumbai."
            </p>
          </blockquote>

          <p
            style={{
              color: textMuted,
              fontSize: '16px',
              lineHeight: 1.8,
              margin: '0 0 20px',
            }}
          >
            For too long, the best restaurant technology was exclusive. ERP systems cost lakhs of rupees
            to implement. POS hardware required expensive specialists. Analytics were reserved for chains
            with full-time IT teams. The result? Small and mid-sized restaurant owners — the backbone of
            India's food culture — were left to manage their businesses with notebooks, basic calculators,
            and WhatsApp groups.
          </p>

          <p
            style={{
              color: textMuted,
              fontSize: '16px',
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            Restro OS was built to change that equation permanently. We offer the same capabilities that
            enterprise restaurant chains pay crores for — digital ordering, live kitchen displays, inventory
            intelligence, staff management, and real-time analytics — at a price that makes sense for a
            restaurant owner who is building their dream one plate at a time.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          THE PROBLEM WE SOLVE
      ════════════════════════════════════════ */}
      <section
        style={{
          padding: '88px 24px',
          background: bg1,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          <p
            style={{
              color: gold,
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            The Problem We Solve
          </p>

          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '0 0 20px',
              letterSpacing: '-0.01em',
            }}
          >
            Indian Restaurants Lose ₹50,000+ Every Month to Inefficiency
          </h2>

          <p
            style={{
              color: textMuted,
              fontSize: '16px',
              lineHeight: 1.8,
              maxWidth: '760px',
              marginBottom: '52px',
            }}
          >
            This is not an abstract claim. We spent six months auditing the operations of 200 restaurants
            across India before we wrote a single line of code. What we found was sobering: the average
            independent restaurant in India bleeds money not because of bad food or poor hospitality, but
            because of operational gaps that the right software can close in days. Here are the five biggest
            recurring problems we documented — and that Restro OS directly solves.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {PAIN_POINTS.map((p, i) => (
              <div
                key={i}
                style={{
                  background: bg2,
                  border: `1px solid ${border}`,
                  borderLeft: `3px solid ${gold}`,
                  borderRadius: '14px',
                  padding: '28px 24px',
                }}
              >
                <p
                  style={{
                    color: goldLight,
                    fontSize: '28px',
                    fontWeight: 900,
                    margin: '0 0 6px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {p.stat}
                </p>
                <p
                  style={{
                    color: textPrimary,
                    fontSize: '14px',
                    fontWeight: 700,
                    margin: '0 0 14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {p.label}
                </p>
                <p
                  style={{
                    color: textMuted,
                    fontSize: '14px',
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {p.detail}
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              color: textMuted,
              fontSize: '15px',
              lineHeight: 1.8,
              marginTop: '40px',
              padding: '24px',
              background: 'rgba(200,151,42,0.04)',
              borderRadius: '12px',
              border: `1px solid ${border}`,
            }}
          >
            When you add these losses together — billing errors, miscommunicated orders, food waste,
            manual reconciliation time, and the cost of operating blind — the average Indian restaurant
            is losing anywhere from ₹40,000 to ₹80,000 every month. Our median customer recovers the
            entire annual cost of Restro OS within the first six weeks of going live.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TIMELINE / OUR JOURNEY
      ════════════════════════════════════════ */}
      <section
        style={{
          padding: '88px 24px',
          background: bg2,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p
            style={{
              color: gold,
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Our Journey
          </p>

          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '0 0 56px',
              letterSpacing: '-0.01em',
            }}
          >
            From One Frustrated Owner to 500+ Restaurants
          </h2>

          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {/* vertical line */}
            <div
              style={{
                position: 'absolute',
                left: '19px',
                top: '10px',
                bottom: '10px',
                width: '2px',
                background: `linear-gradient(to bottom, ${gold}, rgba(200,151,42,0.1))`,
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {TIMELINE.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '32px',
                    paddingBottom: i < TIMELINE.length - 1 ? '48px' : '0',
                    position: 'relative',
                  }}
                >
                  {/* dot */}
                  <div style={{ flexShrink: 0, paddingTop: '4px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(200,151,42,0.12)',
                        border: `2px solid ${gold}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 16px rgba(200,151,42,0.25)`,
                      }}
                    >
                      <span
                        style={{
                          color: goldLight,
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {item.year.slice(2)}
                      </span>
                    </div>
                  </div>

                  {/* content */}
                  <div style={{ paddingTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                      <span
                        style={{
                          color: gold,
                          fontSize: '13px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                        }}
                      >
                        {item.year}
                      </span>
                      <h3
                        style={{
                          color: textPrimary,
                          fontSize: '18px',
                          fontWeight: 800,
                          margin: 0,
                        }}
                      >
                        {item.title}
                      </h3>
                    </div>
                    <p
                      style={{
                        color: textMuted,
                        fontSize: '15px',
                        lineHeight: 1.8,
                        margin: 0,
                      }}
                    >
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          OUR VALUES
      ════════════════════════════════════════ */}
      <section
        style={{
          padding: '88px 24px',
          background: bg1,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          <p
            style={{
              color: gold,
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            What We Stand For
          </p>

          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '0 0 56px',
              letterSpacing: '-0.01em',
            }}
          >
            Our Four Core Values
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {VALUES.map((v, i) => (
              <div
                key={i}
                style={{
                  background: bg2,
                  border: `1px solid ${border}`,
                  borderLeft: `4px solid ${gold}`,
                  borderRadius: '16px',
                  padding: '36px 28px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* decorative icon */}
                <span
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '24px',
                    color: 'rgba(200,151,42,0.12)',
                    fontSize: '64px',
                    lineHeight: 1,
                    fontWeight: 900,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {v.icon}
                </span>

                <h3
                  style={{
                    color: textPrimary,
                    fontSize: '20px',
                    fontWeight: 800,
                    margin: '0 0 16px',
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    color: textMuted,
                    fontSize: '15px',
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          NUMBERS / SOCIAL PROOF
      ════════════════════════════════════════ */}
      <section
        style={{
          padding: '88px 24px',
          background: bg2,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
          <p
            style={{
              color: gold,
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            Restro OS by the Numbers
          </p>

          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '0 0 12px',
              letterSpacing: '-0.01em',
              textAlign: 'center',
            }}
          >
            Real Restaurants. Real Results.
          </h2>

          <p
            style={{
              color: textMuted,
              fontSize: '16px',
              lineHeight: 1.75,
              maxWidth: '560px',
              margin: '0 auto 56px',
              textAlign: 'center',
            }}
          >
            These numbers are not projections or forecasts — they represent actual restaurants, actual orders,
            and actual revenue that flows through our platform every day.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {NUMBERS.map((n, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: bg1,
                  border: `1px solid ${border}`,
                  borderRadius: '20px',
                }}
              >
                <p
                  style={{
                    color: goldLight,
                    fontSize: 'clamp(36px, 4vw, 52px)',
                    fontWeight: 900,
                    margin: '0 0 10px',
                    letterSpacing: '-0.02em',
                    background: `linear-gradient(135deg, ${gold}, ${goldLight})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {n.value}
                </p>
                <p
                  style={{
                    color: textMuted,
                    fontSize: '14px',
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {n.label}
                </p>
              </div>
            ))}
          </div>

          {/* supporting text below numbers */}
          <div
            style={{
              marginTop: '48px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                padding: '24px',
                background: bg1,
                border: `1px solid ${border}`,
                borderRadius: '14px',
              }}
            >
              <p
                style={{
                  color: textPrimary,
                  fontSize: '15px',
                  fontWeight: 700,
                  margin: '0 0 10px',
                }}
              >
                Pan-India Coverage
              </p>
              <p
                style={{
                  color: textMuted,
                  fontSize: '14px',
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                Our restaurant partners span Maharashtra, Bihar, Uttar Pradesh, Delhi NCR, Karnataka,
                Tamil Nadu, Telangana, West Bengal, Gujarat, Rajasthan, Madhya Pradesh, Punjab, Haryana,
                Odisha, and Assam — and we are adding new states every quarter.
              </p>
            </div>
            <div
              style={{
                padding: '24px',
                background: bg1,
                border: `1px solid ${border}`,
                borderRadius: '14px',
              }}
            >
              <p
                style={{
                  color: textPrimary,
                  fontSize: '15px',
                  fontWeight: 700,
                  margin: '0 0 10px',
                }}
              >
                Every Kind of Restaurant
              </p>
              <p
                style={{
                  color: textMuted,
                  fontSize: '14px',
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                We serve roadside dhabas with a single billing terminal, multi-cuisine restaurants with
                complex modifier menus, cloud kitchens managing multiple delivery brands, and franchise
                chains overseeing 10 to 30 outlets from a single management console.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA — JOIN THE RESTRO OS FAMILY
      ════════════════════════════════════════ */}
      <section
        style={{
          padding: '100px 24px',
          background: `linear-gradient(160deg, #0f0a00 0%, ${bg2} 50%, ${bg1} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* warm glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(ellipse 1000px 500px at 50% 100%, rgba(200,151,42,0.09) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative' }}>
          <p
            style={{
              color: gold,
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            Get Started Today
          </p>

          <h2
            style={{
              fontSize: 'clamp(30px, 4.5vw, 56px)',
              fontWeight: 900,
              lineHeight: 1.1,
              margin: '0 0 22px',
              letterSpacing: '-0.02em',
            }}
          >
            Join the{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${gold}, ${goldLight})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Restro OS Family
            </span>
          </h2>

          <p
            style={{
              color: textMuted,
              fontSize: '17px',
              lineHeight: 1.75,
              marginBottom: '48px',
            }}
          >
            Your restaurant deserves the same technology that powers the biggest chains in the country.
            Set up takes less than an hour. No hardware installation required. No long-term contract.
            Join 500+ restaurant owners who made the switch — and never looked back.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <Link href="/signup">
              <span
                style={{
                  display: 'inline-block',
                  padding: '16px 40px',
                  background: `linear-gradient(135deg, #8b5a00, ${gold}, ${goldLight})`,
                  color: '#060400',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: `0 6px 28px rgba(200,151,42,0.35)`,
                  letterSpacing: '0.01em',
                  textDecoration: 'none',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
              >
                Start Free Trial
              </span>
            </Link>

            <Link href="/contact">
              <span
                style={{
                  display: 'inline-block',
                  padding: '16px 40px',
                  background: 'transparent',
                  color: gold,
                  border: `1.5px solid rgba(200,151,42,0.4)`,
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  textDecoration: 'none',
                }}
              >
                Talk to Our Team
              </span>
            </Link>
          </div>

          <p
            style={{
              color: 'rgba(168,144,112,0.6)',
              fontSize: '13px',
              marginTop: '24px',
            }}
          >
            No credit card required &nbsp;·&nbsp; 14-day free trial &nbsp;·&nbsp; Cancel anytime
          </p>
        </div>
      </section>

    </div>
  );
}
