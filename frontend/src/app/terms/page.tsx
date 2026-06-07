import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Restro OS',
  description:
    'Terms of Service for Restro OS restaurant management SaaS platform. Understand your rights, subscription terms, acceptable use policy, and data ownership when using our services.',
}

const tocItems = [
  { num: '01', label: 'Introduction & Acceptance' },
  { num: '02', label: 'Description of Service' },
  { num: '03', label: 'User Accounts & Registration' },
  { num: '04', label: 'Subscription & Payment Terms' },
  { num: '05', label: 'Acceptable Use Policy' },
  { num: '06', label: 'Intellectual Property' },
  { num: '07', label: 'Data & Privacy' },
  { num: '08', label: 'Service Availability & SLA' },
  { num: '09', label: 'Limitation of Liability' },
  { num: '10', label: 'Termination' },
  { num: '11', label: 'Governing Law' },
  { num: '12', label: 'Contact' },
]

const s = {
  page: {
    background: '#050505',
    minHeight: '100vh',
    color: '#d0d0d0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  } as React.CSSProperties,

  hero: {
    background: 'linear-gradient(180deg, #0d0d0d 0%, #050505 100%)',
    borderBottom: '1px solid #1c1c1c',
    padding: '72px 20px 56px',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  heroLabel: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: '#c8972a',
    background: 'rgba(200,151,42,0.1)',
    border: '1px solid rgba(200,151,42,0.25)',
    borderRadius: 4,
    padding: '5px 14px',
    marginBottom: 24,
  } as React.CSSProperties,

  heroTitle: {
    fontSize: 42,
    fontWeight: 700,
    color: '#ffffff',
    margin: '0 0 12px',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  } as React.CSSProperties,

  heroMeta: {
    fontSize: 13,
    color: '#555',
    margin: 0,
  } as React.CSSProperties,

  layout: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 20px 100px',
    display: 'flex',
    gap: 48,
    alignItems: 'flex-start',
  } as React.CSSProperties,

  // Sidebar TOC
  sidebar: {
    width: 220,
    flexShrink: 0,
    position: 'sticky' as const,
    top: 32,
    paddingTop: 40,
  } as React.CSSProperties,

  sidebarHeading: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: '#444',
    marginBottom: 16,
    display: 'block',
  } as React.CSSProperties,

  tocItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '7px 0',
    borderBottom: '1px solid #141414',
    cursor: 'default',
  } as React.CSSProperties,

  tocNum: {
    fontSize: 10,
    fontWeight: 700,
    color: '#c8972a',
    opacity: 0.6,
    flexShrink: 0,
    paddingTop: 1,
    letterSpacing: '0.05em',
  } as React.CSSProperties,

  tocLabel: {
    fontSize: 12,
    color: '#555',
    lineHeight: 1.4,
  } as React.CSSProperties,

  // Main content
  main: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  section: (alt: boolean) =>
    ({
      background: alt ? 'rgba(255,255,255,0.015)' : 'transparent',
      borderRadius: 8,
      padding: '40px 36px',
      margin: '2px 0',
    }) as React.CSSProperties,

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  } as React.CSSProperties,

  sectionNum: {
    fontSize: 11,
    fontWeight: 700,
    color: '#c8972a',
    opacity: 0.5,
    letterSpacing: '0.08em',
    flexShrink: 0,
    paddingTop: 2,
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#c8972a',
    margin: 0,
    letterSpacing: '-0.01em',
  } as React.CSSProperties,

  para: {
    fontSize: 15,
    lineHeight: 1.8,
    color: '#b0b0b0',
    margin: '0 0 14px',
  } as React.CSSProperties,

  ul: {
    paddingLeft: 22,
    margin: '0 0 14px',
  } as React.CSSProperties,

  li: {
    fontSize: 15,
    lineHeight: 1.75,
    color: '#b0b0b0',
    marginBottom: 10,
    paddingLeft: 4,
  } as React.CSSProperties,

  divider: {
    border: 'none',
    borderTop: '1px solid #161616',
    margin: 0,
  } as React.CSSProperties,

  strong: {
    color: '#c8c8c8',
    fontWeight: 600,
  } as React.CSSProperties,

  gold: {
    color: '#c8972a',
    fontWeight: 600,
  } as React.CSSProperties,

  warningBox: {
    background: 'rgba(200,151,42,0.06)',
    border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: 6,
    padding: '14px 18px',
    fontSize: 14,
    lineHeight: 1.65,
    color: '#999',
    margin: '14px 0',
  } as React.CSSProperties,

  contactBox: {
    background: 'rgba(200,151,42,0.06)',
    border: '1px solid rgba(200,151,42,0.2)',
    borderRadius: 8,
    padding: '20px 24px',
    marginTop: 16,
  } as React.CSSProperties,

  contactEmail: {
    fontSize: 16,
    fontWeight: 600,
    color: '#c8972a',
    display: 'block',
    marginBottom: 4,
  } as React.CSSProperties,

  contactNote: {
    fontSize: 13,
    color: '#666',
    margin: 0,
  } as React.CSSProperties,

  footer: {
    borderTop: '1px solid #161616',
    padding: '28px 20px',
    maxWidth: 1100,
    margin: '0 auto',
    fontSize: 13,
    color: '#444',
    lineHeight: 1.6,
  } as React.CSSProperties,
}

export default function TermsPage() {
  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <span style={s.heroLabel}>Legal</span>
        <h1 style={s.heroTitle}>Terms of Service</h1>
        <p style={s.heroMeta}>
          Effective: January 1, 2025 &nbsp;·&nbsp; Last Updated: June 2026
        </p>
      </div>

      <div style={s.layout}>
        {/* Sidebar Table of Contents */}
        <aside style={s.sidebar}>
          <span style={s.sidebarHeading}>Table of Contents</span>
          {tocItems.map((item) => (
            <div key={item.num} style={s.tocItem}>
              <span style={s.tocNum}>{item.num}</span>
              <span style={s.tocLabel}>{item.label}</span>
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main style={s.main}>

          {/* 01 Introduction & Acceptance */}
          <div style={s.section(false)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>01</span>
              <h2 style={s.sectionTitle}>Introduction &amp; Acceptance</h2>
            </div>
            <p style={s.para}>
              Welcome to Restro OS. These Terms of Service (&ldquo;Terms&rdquo;) constitute a
              legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Subscriber&rdquo;,
              or &ldquo;you&rdquo;) and Restro OS (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
              &ldquo;our&rdquo;) governing your access to and use of the Restro OS platform,
              website, mobile applications, and all related services (collectively, the
              &ldquo;Platform&rdquo;).
            </p>
            <p style={s.para}>
              By registering for an account, clicking &ldquo;I Agree&rdquo;, or by accessing or
              using any part of the Platform, you confirm that you have read, understood, and agree
              to be bound by these Terms in their entirety, as well as our Privacy Policy, which
              is incorporated herein by reference. If you are accepting these Terms on behalf of
              a business entity, you represent and warrant that you have the authority to bind
              that entity to these Terms.
            </p>
            <p style={s.para}>
              If you do not agree to any provision of these Terms, you must not access or use the
              Platform. Please contact our support team if you have questions before proceeding.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 02 Description of Service */}
          <div style={s.section(true)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>02</span>
              <h2 style={s.sectionTitle}>Description of Service</h2>
            </div>
            <p style={s.para}>
              Restro OS is a cloud-based Software-as-a-Service (SaaS) platform purpose-built for
              restaurant businesses. Our platform provides an integrated suite of tools designed
              to help restaurant owners and operators run their businesses more efficiently and
              profitably.
            </p>
            <p style={s.para}>Core features of the Restro OS platform include:</p>
            <ul style={s.ul}>
              <li style={s.li}>Digital menu management with real-time pricing and availability updates</li>
              <li style={s.li}>QR code-based contactless ordering for dine-in, takeaway, and delivery</li>
              <li style={s.li}>Point-of-sale (POS) order management and kitchen display system (KDS)</li>
              <li style={s.li}>Table management and reservation system</li>
              <li style={s.li}>Staff management, shift scheduling, and role-based access controls</li>
              <li style={s.li}>Inventory tracking and supplier management</li>
              <li style={s.li}>Business analytics and daily/weekly performance reports</li>
              <li style={s.li}>Customer feedback collection and reputation management tools</li>
              <li style={s.li}>Multi-branch support and centralised head-office dashboard (Enterprise tier)</li>
            </ul>
            <p style={s.para}>
              We continuously improve and expand the platform. New features may be added, and
              existing features may be modified or retired. We will provide advance notice of
              material changes that remove functionality.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 03 User Accounts & Registration */}
          <div style={s.section(false)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>03</span>
              <h2 style={s.sectionTitle}>User Accounts &amp; Registration</h2>
            </div>
            <p style={s.para}>
              To access the Restro OS platform, you must create an account by providing accurate,
              complete, and current information including your name, restaurant details, email
              address, and a valid phone number. You agree to keep this information up to date
              throughout your subscription.
            </p>
            <p style={s.para}>
              Each subscription covers a single restaurant outlet. A separate account is required
              for each location. However, our <span style={s.gold}>Enterprise plan</span> provides
              a unified multi-branch dashboard that allows centralised management of multiple
              outlets under a single subscription — please contact our sales team for Enterprise
              pricing and setup.
            </p>
            <p style={s.para}>
              You are solely responsible for maintaining the confidentiality of your account
              credentials, including your password. You must not share account access with
              unauthorised individuals. You agree to notify us immediately at{' '}
              <span style={s.gold}>support@restroos.com</span> if you suspect any unauthorised
              access to your account. We will not be liable for any loss or damage arising from
              your failure to secure your credentials. You must be at least 18 years of age to
              create an account and use the Platform.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 04 Subscription & Payment Terms */}
          <div style={s.section(true)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>04</span>
              <h2 style={s.sectionTitle}>Subscription &amp; Payment Terms</h2>
            </div>
            <p style={s.para}>
              Restro OS is offered on a subscription basis. Plans are billed on a monthly or
              annual cycle, as selected by you at the time of purchase. Annual plans are billed
              upfront as a single payment and are non-refundable except where required by law.
            </p>
            <p style={s.para}>
              <strong style={s.strong}>Auto-renewal:</strong> All subscriptions renew automatically
              at the end of each billing cycle. You authorise us to charge your saved payment method
              for the renewal amount. You may cancel auto-renewal at any time from your account
              settings, effective at the end of the current billing period. Cancellation does not
              entitle you to a refund for any unused portion of the current period.
            </p>
            <p style={s.para}>
              <strong style={s.strong}>Price changes:</strong> We reserve the right to adjust
              subscription pricing at any time. We will notify you of any price changes via email
              and in-platform notification at least <span style={s.gold}>30 days before</span> the
              new price takes effect. Your continued use of the Platform after the effective date
              constitutes acceptance of the new pricing. If you do not accept the new price, you
              may cancel before the change takes effect.
            </p>
            <p style={s.para}>
              <strong style={s.strong}>Payment methods:</strong> We accept payments via
              credit/debit cards (Visa, Mastercard, RuPay), UPI, net banking, and select digital
              wallets through our payment partners Razorpay and Stripe. All transactions are
              processed in INR unless otherwise specified.
            </p>
            <p style={s.para}>
              <strong style={s.strong}>Failed payments:</strong> If a payment fails, we will retry
              the charge over 7 days using the payment method on file. We will notify you of the
              failure via email. If payment remains outstanding after the retry period, your account
              may be suspended. Access is restored automatically upon successful payment. Repeated
              non-payment may result in permanent account termination.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 05 Acceptable Use Policy */}
          <div style={s.section(false)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>05</span>
              <h2 style={s.sectionTitle}>Acceptable Use Policy</h2>
            </div>
            <p style={s.para}>
              Restro OS grants you a limited, non-exclusive, non-transferable, revocable licence
              to access and use the Platform solely for your internal restaurant business operations
              in accordance with these Terms. You agree not to use the Platform for any of the
              following prohibited purposes:
            </p>
            <ul style={s.ul}>
              <li style={s.li}>Any unlawful, fraudulent, or deceptive activity, or in violation of any applicable local, national, or international laws or regulations</li>
              <li style={s.li}>Scraping, crawling, mirroring, or systematically extracting data from the Platform without our prior written consent</li>
              <li style={s.li}>Reverse engineering, decompiling, disassembling, or attempting to derive the source code or underlying architecture of the Platform</li>
              <li style={s.li}>Using the Platform to build a competing product or service, or for benchmarking purposes without our written permission</li>
              <li style={s.li}>Uploading or transmitting any viruses, malware, ransomware, or any code designed to damage, disrupt, or gain unauthorised access to any system</li>
              <li style={s.li}>Posting abusive, defamatory, obscene, or otherwise objectionable content via any Platform feature</li>
              <li style={s.li}>Attempting to gain unauthorised access to any part of the Platform, its servers, or any connected third-party systems</li>
              <li style={s.li}>Impersonating any person, restaurant, or entity, or misrepresenting your affiliation with any person or organisation</li>
            </ul>
            <p style={s.para}>
              Violation of this Acceptable Use Policy may result in immediate suspension or
              termination of your account without refund, at our sole discretion.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 06 Intellectual Property */}
          <div style={s.section(true)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>06</span>
              <h2 style={s.sectionTitle}>Intellectual Property</h2>
            </div>
            <p style={s.para}>
              The Restro OS platform — including its design, user interface, code, architecture,
              logos, trademarks, brand assets, documentation, and all original content — is and
              shall remain the exclusive intellectual property of Restro OS and its licensors. All
              rights not expressly granted to you under these Terms are reserved.
            </p>
            <p style={s.para}>
              <strong style={s.strong}>Your data is yours.</strong> All restaurant data you create,
              upload, or generate within the Platform — including menu content, order records,
              customer information, staff data, and financial reports — remains your property at
              all times. We do not claim ownership of your operational data.
            </p>
            <p style={s.para}>
              By uploading content to the Platform, you grant Restro OS a limited, worldwide,
              royalty-free licence to store, process, display, and use that content strictly for
              the purpose of operating and improving the Platform for your benefit. This licence
              terminates when you close your account and your data is deleted from our systems.
              Our trademarks and brand identity may not be used in any form without our prior
              explicit written consent.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 07 Data & Privacy */}
          <div style={s.section(false)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>07</span>
              <h2 style={s.sectionTitle}>Data &amp; Privacy</h2>
            </div>
            <p style={s.para}>
              Your use of the Platform is also governed by our{' '}
              <span style={s.gold}>Privacy Policy</span>, which is incorporated into these Terms
              by reference. The Privacy Policy describes in full how we collect, use, store, and
              protect your personal information, as well as your rights regarding your data. We
              encourage you to read it carefully at restroos.com/privacy.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 08 Service Availability & SLA */}
          <div style={s.section(true)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>08</span>
              <h2 style={s.sectionTitle}>Service Availability &amp; SLA</h2>
            </div>
            <p style={s.para}>
              We target a platform uptime of{' '}
              <span style={s.gold}>99.9%</span> per calendar month, measured across our core
              services (dashboard, ordering, POS, and reporting). This equates to less than
              approximately 44 minutes of unplanned downtime per month.
            </p>
            <p style={s.para}>
              <strong style={s.strong}>Scheduled maintenance:</strong> We perform routine
              maintenance and system upgrades during low-traffic windows, typically between
              02:00–05:00 IST. We will provide at least 24 hours of advance notice for scheduled
              maintenance that is expected to impact platform availability.
            </p>
            <p style={s.para}>
              <strong style={s.strong}>Limitation:</strong> We are not liable for downtime caused
              by circumstances beyond our reasonable control, including but not limited to internet
              infrastructure failures, force majeure events, third-party service outages (e.g.
              payment processors, hosting providers), or your own network issues. The 99.9% SLA
              target excludes scheduled maintenance windows. Service credits for SLA breaches, if
              applicable, are available to subscribers on our Pro and Enterprise plans — contact
              support to file a claim within 30 days of the incident.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 09 Limitation of Liability */}
          <div style={s.section(false)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>09</span>
              <h2 style={s.sectionTitle}>Limitation of Liability</h2>
            </div>
            <div style={s.warningBox}>
              PLEASE READ THIS SECTION CAREFULLY AS IT LIMITS OUR LIABILITY TO YOU.
            </div>
            <p style={s.para}>
              The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranties of any kind, either express or implied, including but not limited to
              implied warranties of merchantability, fitness for a particular purpose, or
              non-infringement. We do not warrant that the Platform will be uninterrupted,
              error-free, or completely secure.
            </p>
            <p style={s.para}>
              To the maximum extent permitted by applicable law, Restro OS and its directors,
              employees, partners, agents, and affiliates shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages — including loss of revenue,
              loss of profits, loss of data, loss of goodwill, or business interruption — arising
              from your use of or inability to use the Platform, even if we have been advised of
              the possibility of such damages.
            </p>
            <p style={s.para}>
              In no event shall our total aggregate liability to you for all claims arising under
              or related to these Terms exceed the total subscription fees paid by you to Restro OS
              in the <span style={s.gold}>three (3) months</span> immediately preceding the event
              giving rise to the claim. This limitation applies regardless of the form of action,
              whether in contract, tort, negligence, or otherwise.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 10 Termination */}
          <div style={s.section(true)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>10</span>
              <h2 style={s.sectionTitle}>Termination</h2>
            </div>
            <p style={s.para}>
              <strong style={s.strong}>Termination by you:</strong> You may cancel your Restro OS
              subscription at any time by accessing your account settings and selecting
              &ldquo;Cancel Subscription&rdquo;, or by contacting our support team. Cancellation
              takes effect at the end of your current billing period. You will continue to have
              full platform access until then.
            </p>
            <p style={s.para}>
              <strong style={s.strong}>Termination by us:</strong> We reserve the right to suspend
              or permanently terminate your account, with or without notice, if you breach any
              provision of these Terms, fail to pay outstanding subscription fees, or engage in
              conduct we determine to be harmful to the Platform or other users.
            </p>
            <p style={s.para}>
              <strong style={s.strong}>Data after termination:</strong> Upon account closure —
              whether voluntary or involuntary — you have a{' '}
              <span style={s.gold}>30-day data export window</span> during which you may request
              a full export of your restaurant data (menus, orders, customer records) in CSV or
              JSON format. After this 30-day period, your data will be permanently deleted from
              our systems and cannot be recovered. We strongly recommend exporting your data
              before closing your account. To request a data export, contact{' '}
              <span style={s.gold}>support@restroos.com</span>.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 11 Governing Law */}
          <div style={s.section(false)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>11</span>
              <h2 style={s.sectionTitle}>Governing Law</h2>
            </div>
            <p style={s.para}>
              These Terms shall be governed by and construed in accordance with the laws of India,
              without regard to its conflict of law principles. Any dispute arising out of or in
              connection with these Terms or your use of the Platform shall be subject to the
              exclusive jurisdiction of the courts located in India. By using the Platform, you
              irrevocably consent to the jurisdiction of such courts for the resolution of any
              such dispute. If any provision of these Terms is held to be invalid or unenforceable,
              the remaining provisions will continue in full force and effect.
            </p>
          </div>

          <hr style={s.divider} />

          {/* 12 Contact */}
          <div style={s.section(true)}>
            <div style={s.sectionHeader}>
              <span style={s.sectionNum}>12</span>
              <h2 style={s.sectionTitle}>Contact</h2>
            </div>
            <p style={s.para}>
              If you have any questions about these Terms of Service, need clarification on any
              provision, or wish to report a violation, please contact our legal and support team.
              We aim to respond to all legal inquiries within 30 business days.
            </p>
            <div style={s.contactBox}>
              <span style={s.contactEmail}>legal@restroos.com</span>
              <p style={s.contactNote}>Legal &amp; Compliance Team &mdash; Restro OS</p>
              <p style={{ ...s.contactNote, marginTop: 4 }}>
                For general support: support@restroos.com
              </p>
            </div>
          </div>

        </main>
      </div>

      {/* Footer note */}
      <div style={s.footer}>
        <p style={{ margin: 0 }}>
          &copy; 2025&ndash;2026 Restro OS. All rights reserved. &nbsp;·&nbsp; These Terms are
          effective as of January 1, 2025 and were last revised in June 2026. &nbsp;·&nbsp;{' '}
          <span style={{ color: '#555' }}>
            This document constitutes the entire agreement between you and Restro OS regarding
            use of the Platform.
          </span>
        </p>
      </div>
    </div>
  )
}
