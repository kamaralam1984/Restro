import type { Metadata } from 'next';
import Link from 'next/link';

// ─── SEO Metadata ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Features - Restro OS | Complete Restaurant Management Platform',
  description:
    'Discover every tool your restaurant needs: smart menu, online ordering, table booking, billing POS, analytics, CRM, and multi-branch control — all in one platform.',
  keywords: [
    'restaurant management software',
    'online ordering system',
    'restaurant POS',
    'table booking software',
    'restaurant analytics',
    'menu management',
    'restaurant CRM',
    'multi-branch restaurant',
    'Restro OS features',
  ],
  openGraph: {
    title: 'Features - Restro OS | Complete Restaurant Management Platform',
    description:
      'Discover every tool your restaurant needs: smart menu, online ordering, table booking, billing POS, analytics, CRM, and multi-branch control — all in one platform.',
    type: 'website',
  },
};

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🍽️',
    title: 'Smart Menu Management',
    description:
      'Create and update your digital menu in real time with zero technical skill required. Add photos, descriptions, prices, variants, and availability toggles straight from your phone or laptop. Customers always see what is actually in stock — no more awkward "sorry, this item is unavailable" moments that kill the dining experience and damage your reputation. Seasonal specials, sold-out items, and price changes publish instantly across your website, QR menus, and ordering pages.',
  },
  {
    icon: '📱',
    title: 'Online Ordering System',
    description:
      'Accept online orders 24 hours a day, 7 days a week without paying a single rupee in commission to third-party aggregators. Every direct order goes straight to your kitchen display or printer in seconds. Reduce costly order errors caused by phone miscommunication, increase average order value with smart upsell prompts, and own your complete customer data — something Swiggy and Zomato will never give you. Your restaurant, your revenue, your relationship.',
  },
  {
    icon: '📅',
    title: 'Table Booking & Reservations',
    description:
      'Let guests book tables directly from your website, Google Business profile, or social media pages around the clock. Automated confirmation messages go out instantly via SMS and email so guests never wonder if their booking went through. Capacity management prevents double-booking on peak nights. Waitlist management fills last-minute cancellations automatically. Never miss a profitable reservation or disappoint a party that drove across town for your restaurant again.',
  },
  {
    icon: '💳',
    title: 'Billing & POS System',
    description:
      'Generate GST-ready invoices in seconds, handle split billing for large groups effortlessly, and accept every payment mode — cash, UPI, card, and wallets — from a single screen. The system works fully offline when your internet drops, so busy Saturday nights never grind to a halt. Track cash flow shift-by-shift, audit every discount and void, and close your books at end of day without the usual spreadsheet chaos. Billing errors become a thing of the past.',
  },
  {
    icon: '📊',
    title: 'Revenue Analytics',
    description:
      'Your real-time analytics dashboard surfaces daily sales figures, your top-performing dishes, peak service hours, and customer ordering trends — all without opening a single spreadsheet. Make confident, data-driven decisions about menu engineering, staffing levels, and marketing spend instead of relying on gut feeling and guesswork. Know precisely which menu items drive the highest profit margin, which hours need extra kitchen staff, and which promotions are actually moving the needle.',
  },
  {
    icon: '👥',
    title: 'Staff & Role Management',
    description:
      'Assign granular roles — manager, head cashier, waiter, kitchen staff — and control exactly what each person can see and do inside the system. Track attendance with clock-in records, monitor individual performance metrics, and set clear accountability for every shift. Eliminate buddy punching, unauthorized discount abuse, and the confusion of shared login credentials. When a staff member leaves, a single click revokes all access instantly. Run a tighter operation with complete visibility.',
  },
  {
    icon: '🚀',
    title: 'Marketing & CRM Tools',
    description:
      'Restro OS maintains a full customer database automatically — every guest who orders online or books a table is captured. Launch targeted email and SMS campaigns with a few clicks, build loyalty point programs that keep regulars coming back, and recover abandoned online carts with automated follow-up messages. Segment your audience by visit frequency, average spend, or favorite dish category. The restaurants growing fastest are not spending more on ads — they are re-engaging customers they already won.',
  },
  {
    icon: '🏢',
    title: 'Multi-Branch Control',
    description:
      'Manage 10 outlets or 100 from a single unified dashboard without complexity multiplying with every new location. Push centralized menu updates, standardize pricing across all branches, and pull consolidated financial reporting in seconds. Each branch retains its own localized staff, inventory, and booking management while you maintain eagle-eye visibility across the entire chain. Restro OS scales with your ambitions — from your first outlet to your hundredth, the platform never becomes your bottleneck.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Sign Up & Customize — Ready in 30 Seconds',
    description:
      'Create your Restro OS account with your email address and restaurant name — no credit card required to start your free trial. The guided setup wizard walks you through uploading your logo, setting your brand colors, and entering your restaurant details in under two minutes. Choose your plan, invite your first staff member, and your account is live. There is no complex installation, no server setup, and no IT department needed. The entire onboarding process is designed to get you from zero to operational before your lunch rush begins.',
  },
  {
    number: '02',
    title: 'Go Live with Your Digital Menu',
    description:
      'Use the intuitive drag-and-drop menu builder to add your dishes, upload photos, set prices, and organize categories exactly the way you want them displayed. Import from a spreadsheet or build from scratch — both take minutes, not days. Once published, your menu is instantly live on your branded ordering page, your QR dine-in menus, and your embedded website widget. Every update you make — a price change, a new seasonal dish, a sold-out toggle — reflects for customers in real time across every channel simultaneously.',
  },
  {
    number: '03',
    title: 'Start Taking Orders, Bookings & Growing Revenue',
    description:
      'With your menu live and your system configured, orders and bookings start flowing into your dashboard immediately. Your kitchen receives instant order tickets, your front-of-house team manages tables and reservations from a clean interface, and your billing desk closes transactions in seconds. Meanwhile, the analytics engine starts building your revenue picture automatically. Within your first week, you will have data on your busiest hours, your most popular dishes, and your daily revenue trend — intelligence that took most restaurant owners years of guesswork to approximate.',
  },
];

const COMPARISON = [
  {
    area: 'Menu Updates',
    oldWay: 'Print new menus. Wait days. Spend thousands per reprint cycle. Customers see outdated prices.',
    restroWay: 'Update in 10 seconds from your phone. Live instantly across all channels. Zero printing cost.',
  },
  {
    area: 'Order Taking',
    oldWay: 'Handwritten tickets. Phone orders misheard. Third-party apps taking 25–30% commission on every order.',
    restroWay: 'Digital orders direct to kitchen. Zero commission. Every order confirmed, detailed, and tracked.',
  },
  {
    area: 'Reservations',
    oldWay: 'Paper reservation book. Missed calls. Double bookings on busy nights. No-shows with no warning.',
    restroWay: 'Automated 24/7 booking. SMS/email confirmations. Waitlist fills cancellations. Zero missed revenue.',
  },
  {
    area: 'End-of-Day Billing',
    oldWay: 'Manual cash count. Spreadsheet reconciliation. Billing errors found days later. Staff discrepancies uncaught.',
    restroWay: 'Automated shift reports. Every rupee accounted for. Discounts audited. Close books in minutes, not hours.',
  },
  {
    area: 'Business Decisions',
    oldWay: 'Gut feeling. Which dish is profitable? Unknown. Peak hours? A guess. Marketing ROI? Invisible.',
    restroWay: 'Real-time dashboard. Top dishes by margin. Peak hour heatmap. Campaign performance tracked to the rupee.',
  },
];

const STATS = [
  { value: '500+', label: 'Restaurants Powered', sub: 'Across India and growing' },
  { value: '2M+', label: 'Orders Processed', sub: 'Commission-free, direct revenue' },
  { value: '40%', label: 'Revenue Increase', sub: 'Average across active restaurants' },
  { value: '90%', label: 'Billing Error Reduction', sub: 'From day one of going live' },
];

const CTA_BENEFITS = [
  '14-day free trial — no credit card required',
  'Full access to every feature from day one',
  'Setup support from our onboarding team',
  'Cancel any time, no lock-in contracts',
  'Works on any device — phone, tablet, desktop',
  'Data export always available — your data, yours forever',
];

// ─── Page Component ──────────────────────────────────────────────────────────

export default function FeaturesPage() {
  return (
    <>
      <style>{`
        /* ── Reset & Base ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .feat-page {
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
          background: #050505;
          color: #e0e0e0;
          line-height: 1.7;
          overflow-x: hidden;
        }

        /* ── Typography Scale ── */
        .feat-page h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.02em; }
        .feat-page h2 { font-size: clamp(1.6rem, 3.5vw, 2.6rem); font-weight: 700; line-height: 1.25; }
        .feat-page h3 { font-size: clamp(1.1rem, 2vw, 1.4rem); font-weight: 700; line-height: 1.35; }
        .feat-page p  { font-size: clamp(0.95rem, 1.5vw, 1.05rem); }

        /* ── Layout Helpers ── */
        .feat-container { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
        .feat-section   { padding: 96px 0; }

        /* ── NAV ── */
        .feat-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(5,5,5,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(200,151,42,0.15);
          padding: 16px 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .feat-nav-logo { font-size: 1.3rem; font-weight: 800; color: #c8972a; text-decoration: none; letter-spacing: -0.01em; }
        .feat-nav-links { display: flex; gap: 32px; list-style: none; }
        .feat-nav-links a { color: #aaa; font-size: 0.9rem; text-decoration: none; transition: color 0.2s; }
        .feat-nav-links a:hover { color: #c8972a; }
        .feat-nav-cta {
          background: #c8972a; color: #050505; border: none; border-radius: 8px;
          padding: 10px 22px; font-size: 0.9rem; font-weight: 700;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: opacity 0.2s;
        }
        .feat-nav-cta:hover { opacity: 0.85; }

        /* ── HERO ── */
        .feat-hero {
          background: linear-gradient(160deg, #050505 0%, #0d0a04 50%, #080808 100%);
          padding: 120px 24px 96px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .feat-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,151,42,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .feat-hero-badge {
          display: inline-block;
          background: rgba(200,151,42,0.12);
          border: 1px solid rgba(200,151,42,0.35);
          color: #c8972a;
          border-radius: 100px;
          padding: 6px 20px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 28px;
        }
        .feat-hero h1 { color: #fff; margin-bottom: 24px; }
        .feat-hero h1 span { color: #c8972a; }
        .feat-hero-sub {
          max-width: 640px;
          margin: 0 auto 40px;
          color: #bbb;
          font-size: clamp(1rem, 2vw, 1.15rem);
          line-height: 1.75;
        }
        .feat-hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-primary {
          background: #c8972a; color: #050505; border: none; border-radius: 10px;
          padding: 16px 36px; font-size: 1rem; font-weight: 800;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-outline {
          background: transparent; color: #c8972a;
          border: 2px solid rgba(200,151,42,0.5);
          border-radius: 10px; padding: 14px 34px; font-size: 1rem; font-weight: 700;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: border-color 0.2s, background 0.2s;
        }
        .btn-outline:hover { border-color: #c8972a; background: rgba(200,151,42,0.07); }

        /* ── SECTION LABELS ── */
        .section-label {
          display: inline-block;
          color: #c8972a;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .section-title { color: #fff; margin-bottom: 16px; }
        .section-title span { color: #c8972a; }
        .section-desc { color: #999; max-width: 600px; margin-bottom: 64px; }
        .section-desc.centered { margin-left: auto; margin-right: auto; text-align: center; }

        /* ── FEATURES GRID ── */
        .feat-grid-section { background: #080808; }
        .feat-grid-header { text-align: center; }
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .feat-card {
          background: #0d0d0d;
          border: 1px solid rgba(200,151,42,0.12);
          border-radius: 16px;
          padding: 32px 28px;
          transition: border-color 0.25s, transform 0.2s, background 0.25s;
          position: relative;
          overflow: hidden;
        }
        .feat-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #c8972a, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feat-card:hover { border-color: rgba(200,151,42,0.4); transform: translateY(-3px); background: #111; }
        .feat-card:hover::before { opacity: 1; }
        .feat-card-icon {
          font-size: 2.4rem;
          margin-bottom: 18px;
          display: block;
          line-height: 1;
        }
        .feat-card h3 { color: #c8972a; margin-bottom: 14px; }
        .feat-card p { color: #a0a0a0; font-size: 0.95rem; line-height: 1.75; }

        /* ── HOW IT WORKS ── */
        .feat-steps-section { background: #050505; }
        .feat-steps-header { text-align: center; }
        .feat-steps { display: flex; flex-direction: column; gap: 0; position: relative; }
        .feat-steps::before {
          content: '';
          position: absolute; left: 36px; top: 48px; bottom: 48px; width: 2px;
          background: linear-gradient(to bottom, #c8972a, rgba(200,151,42,0.1));
        }
        .feat-step {
          display: flex; gap: 36px; align-items: flex-start;
          padding: 48px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .feat-step:last-child { border-bottom: none; }
        .feat-step-number {
          flex-shrink: 0;
          width: 72px; height: 72px;
          border-radius: 50%;
          background: #0d0d0d;
          border: 2px solid #c8972a;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; font-weight: 800; color: #c8972a;
          position: relative; z-index: 1;
        }
        .feat-step-body { flex: 1; padding-top: 12px; }
        .feat-step-body h3 { color: #fff; margin-bottom: 16px; }
        .feat-step-body p { color: #999; line-height: 1.8; }

        /* ── COMPARISON TABLE ── */
        .feat-comparison-section { background: #0a0a0a; }
        .feat-comparison-header { text-align: center; }
        .feat-table-wrap { overflow-x: auto; border-radius: 16px; border: 1px solid rgba(200,151,42,0.15); }
        .feat-table {
          width: 100%; border-collapse: collapse; min-width: 640px;
          background: #0d0d0d;
        }
        .feat-table thead tr { background: rgba(200,151,42,0.1); }
        .feat-table th {
          padding: 20px 24px; text-align: left;
          font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          border-bottom: 1px solid rgba(200,151,42,0.2);
        }
        .feat-table th:first-child { color: #888; }
        .feat-table th:nth-child(2) { color: #ff6b6b; }
        .feat-table th:nth-child(3) { color: #c8972a; }
        .feat-table td {
          padding: 20px 24px; vertical-align: top;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.93rem; line-height: 1.6;
        }
        .feat-table tr:last-child td { border-bottom: none; }
        .feat-table td:first-child { color: #c8972a; font-weight: 700; font-size: 0.88rem; letter-spacing: 0.04em; text-transform: uppercase; }
        .feat-table td:nth-child(2) { color: #888; }
        .feat-table td:nth-child(3) { color: #d0d0d0; }
        .feat-table tr:hover td { background: rgba(200,151,42,0.03); }
        .bad-icon { color: #ff6b6b; margin-right: 6px; }
        .good-icon { color: #4ade80; margin-right: 6px; }

        /* ── STATS STRIP ── */
        .feat-stats-section {
          background: linear-gradient(135deg, #0a0800 0%, #080808 50%, #0a0800 100%);
          border-top: 1px solid rgba(200,151,42,0.2);
          border-bottom: 1px solid rgba(200,151,42,0.2);
          padding: 72px 24px;
        }
        .feat-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 48px;
          text-align: center;
        }
        .feat-stat-value {
          font-size: clamp(2.4rem, 5vw, 3.5rem);
          font-weight: 800;
          color: #c8972a;
          line-height: 1;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }
        .feat-stat-label {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 6px;
        }
        .feat-stat-sub { font-size: 0.82rem; color: #666; }

        /* ── CTA ── */
        .feat-cta-section {
          background: linear-gradient(160deg, #080808 0%, #0d0a04 50%, #080808 100%);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .feat-cta-section::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 100%, rgba(200,151,42,0.09) 0%, transparent 70%);
          pointer-events: none;
        }
        .feat-cta-section h2 { color: #fff; margin-bottom: 20px; }
        .feat-cta-section h2 span { color: #c8972a; }
        .feat-cta-section > .feat-container > p { color: #aaa; max-width: 560px; margin: 0 auto 48px; font-size: 1.05rem; line-height: 1.75; }
        .feat-cta-benefits {
          list-style: none;
          display: flex; flex-direction: column; gap: 12px;
          align-items: center; margin-bottom: 48px;
        }
        .feat-cta-benefits li { color: #bbb; font-size: 0.97rem; display: flex; align-items: center; gap: 10px; }
        .check-icon { color: #c8972a; font-size: 1rem; flex-shrink: 0; }
        .feat-cta-note { color: #555; font-size: 0.82rem; margin-top: 20px; }

        /* ── FOOTER ── */
        .feat-footer {
          background: #030303;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 40px 24px;
          text-align: center;
        }
        .feat-footer-links { display: flex; gap: 32px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
        .feat-footer-links a { color: #555; font-size: 0.85rem; text-decoration: none; transition: color 0.2s; }
        .feat-footer-links a:hover { color: #c8972a; }
        .feat-footer-copy { color: #333; font-size: 0.8rem; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .feat-section { padding: 64px 0; }
          .feat-nav-links { display: none; }
          .feat-hero { padding: 80px 20px 64px; }
          .feat-grid { grid-template-columns: 1fr; gap: 16px; }
          .feat-steps::before { left: 28px; }
          .feat-step { flex-direction: column; gap: 20px; }
          .feat-step-number { width: 56px; height: 56px; font-size: 1.1rem; }
          .feat-step-body { padding-top: 0; }
          .feat-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
          .feat-table { min-width: 520px; }
          .feat-hero-actions { flex-direction: column; align-items: center; }
          .btn-primary, .btn-outline { width: 100%; max-width: 320px; text-align: center; }
        }

        @media (max-width: 480px) {
          .feat-stats-grid { grid-template-columns: 1fr; gap: 28px; }
          .feat-card { padding: 24px 20px; }
        }

        @media (min-width: 900px) {
          .feat-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1100px) {
          .feat-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div className="feat-page">

        {/* ── Navigation ── */}
        <nav className="feat-nav" aria-label="Main navigation">
          <Link href="/" className="feat-nav-logo" aria-label="Restro OS Home">
            Restro OS
          </Link>
          <ul className="feat-nav-links">
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <Link href="/signup" className="feat-nav-cta">Start Free Trial</Link>
        </nav>

        {/* ═══════════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════════ */}
        <section className="feat-hero" aria-labelledby="hero-heading">
          <div className="feat-container">
            <div className="feat-hero-badge" aria-label="Platform category">All-in-One Restaurant OS</div>

            <h1 id="hero-heading">
              Every Feature Your Restaurant Needs<br />
              to <span>Dominate</span>
            </h1>

            <p className="feat-hero-sub">
              Restro OS is the single platform that replaces every disconnected tool you have been stitching together.
              From your digital menu and online ordering to table reservations, billing, staff control, and revenue analytics
              — everything lives in one place, works together seamlessly, and is built specifically for the way
              Indian restaurants actually operate.
            </p>

            <p className="feat-hero-sub" style={{ marginBottom: '40px', marginTop: '-16px', fontSize: '1rem', color: '#888' }}>
              Stop paying commissions to aggregators. Stop losing reservations to missed phone calls.
              Stop making business decisions on guesswork. Join over 500 restaurants that switched to Restro OS
              and never looked back.
            </p>

            <div className="feat-hero-actions">
              <Link href="/signup" className="btn-primary">Start Free Trial — No Card Needed</Link>
              <Link href="/pricing" className="btn-outline">See Pricing Plans</Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            CORE FEATURES GRID
        ═══════════════════════════════════════════════════════════ */}
        <section className="feat-section feat-grid-section" aria-labelledby="features-heading">
          <div className="feat-container">
            <div className="feat-grid-header">
              <span className="section-label">Platform Capabilities</span>
              <h2 id="features-heading" className="section-title">
                Eight Powerful Tools.<br /><span>One Unified Platform.</span>
              </h2>
              <p className="section-desc centered">
                Every module is built to work together out of the box. No integrations to configure, no APIs to connect,
                no third-party subscriptions to stack. One login. One dashboard. One source of truth for your entire restaurant business.
              </p>
            </div>

            <div className="feat-grid" role="list" aria-label="Feature list">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="feat-card"
                  role="listitem"
                >
                  <span className="feat-card-icon" aria-hidden="true">{feature.icon}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            STATS STRIP
        ═══════════════════════════════════════════════════════════ */}
        <section className="feat-stats-section" aria-label="Platform statistics">
          <div className="feat-container">
            <div className="feat-stats-grid">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="feat-stat-value">{stat.value}</div>
                  <div className="feat-stat-label">{stat.label}</div>
                  <div className="feat-stat-sub">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            HOW IT WORKS — 3 STEPS
        ═══════════════════════════════════════════════════════════ */}
        <section className="feat-section feat-steps-section" aria-labelledby="steps-heading">
          <div className="feat-container">
            <div className="feat-steps-header">
              <span className="section-label">Getting Started</span>
              <h2 id="steps-heading" className="section-title">
                From Sign-Up to <span>Full Operation</span> in Minutes
              </h2>
              <p className="section-desc centered">
                We designed onboarding for busy restaurant owners who do not have time for lengthy setups.
                Most restaurants are fully live and taking orders within the same day they sign up.
              </p>
            </div>

            <ol className="feat-steps" aria-label="Setup steps">
              {STEPS.map((step) => (
                <li key={step.number} className="feat-step">
                  <div className="feat-step-number" aria-label={`Step ${step.number}`}>
                    {step.number}
                  </div>
                  <div className="feat-step-body">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            COMPARISON TABLE
        ═══════════════════════════════════════════════════════════ */}
        <section className="feat-section feat-comparison-section" aria-labelledby="comparison-heading">
          <div className="feat-container">
            <div className="feat-comparison-header">
              <span className="section-label">The Difference</span>
              <h2 id="comparison-heading" className="section-title">
                Restro OS vs <span>Manual Methods</span>
              </h2>
              <p className="section-desc centered">
                Most restaurants are losing time, money, and customers to outdated, disconnected tools.
                Here is exactly what changes when you switch to a modern, unified restaurant OS.
              </p>
            </div>

            <div className="feat-table-wrap" role="region" aria-label="Feature comparison table">
              <table className="feat-table">
                <thead>
                  <tr>
                    <th scope="col">Area</th>
                    <th scope="col"><span aria-hidden="true">✗</span> The Old Way</th>
                    <th scope="col"><span aria-hidden="true">✓</span> With Restro OS</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.area}>
                      <td>{row.area}</td>
                      <td>
                        <span className="bad-icon" aria-hidden="true">✗</span>
                        {row.oldWay}
                      </td>
                      <td>
                        <span className="good-icon" aria-hidden="true">✓</span>
                        {row.restroWay}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            CTA SECTION
        ═══════════════════════════════════════════════════════════ */}
        <section className="feat-section feat-cta-section" aria-labelledby="cta-heading">
          <div className="feat-container">
            <span className="section-label">Get Started Today</span>
            <h2 id="cta-heading">
              Start Your <span>Free Trial</span> Today
            </h2>
            <p>
              No risk, no complexity, no long-term commitment. Get full access to every Restro OS feature
              during your trial period and see firsthand what a fully unified restaurant management platform
              does for your daily operations and your bottom line.
            </p>

            <ul className="feat-cta-benefits" aria-label="Trial benefits">
              {CTA_BENEFITS.map((benefit) => (
                <li key={benefit}>
                  <span className="check-icon" aria-hidden="true">✦</span>
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="feat-hero-actions">
              <Link href="/signup" className="btn-primary">Create Your Free Account</Link>
              <Link href="/contact" className="btn-outline">Talk to Our Team</Link>
            </div>

            <p className="feat-cta-note">
              Questions? Email us at support@restroos.com — average response time is under 2 hours on business days.
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="feat-footer">
          <nav className="feat-footer-links" aria-label="Footer navigation">
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </nav>
          <p className="feat-footer-copy">
            &copy; {new Date().getFullYear()} Restro OS. All rights reserved. Built for restaurant owners who mean business.
          </p>
        </footer>

      </div>
    </>
  );
}
