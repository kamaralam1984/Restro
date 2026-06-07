import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Restro OS',
  description:
    'Learn how Restro OS collects, uses, and protects your personal information when you use our restaurant management SaaS platform. Full privacy policy with GDPR considerations.',
}

const styles = {
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

  body: {
    maxWidth: 820,
    margin: '0 auto',
    padding: '0 20px 100px',
  } as React.CSSProperties,

  section: (alt: boolean) =>
    ({
      background: alt ? 'rgba(255,255,255,0.015)' : 'transparent',
      borderRadius: 8,
      padding: '40px 36px',
      margin: '2px 0',
    }) as React.CSSProperties,

  sectionInner: {
    maxWidth: 720,
  } as React.CSSProperties,

  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: '#c8972a',
    opacity: 0.7,
    marginBottom: 6,
    display: 'block',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#c8972a',
    margin: '0 0 18px',
    letterSpacing: '-0.01em',
  } as React.CSSProperties,

  para: {
    fontSize: 15,
    lineHeight: 1.8,
    color: '#b0b0b0',
    margin: '0 0 14px',
  } as React.CSSProperties,

  listItem: {
    fontSize: 15,
    lineHeight: 1.75,
    color: '#b0b0b0',
    marginBottom: 10,
    paddingLeft: 8,
  } as React.CSSProperties,

  ul: {
    paddingLeft: 22,
    margin: '0 0 14px',
  } as React.CSSProperties,

  divider: {
    border: 'none',
    borderTop: '1px solid #161616',
    margin: '0',
  } as React.CSSProperties,

  highlight: {
    color: '#c8972a',
    fontWeight: 600,
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
    maxWidth: 820,
    margin: '0 auto',
    fontSize: 13,
    color: '#444',
    lineHeight: 1.6,
  } as React.CSSProperties,
}

export default function PrivacyPage() {
  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <span style={styles.heroLabel}>Legal</span>
        <h1 style={styles.heroTitle}>Privacy Policy</h1>
        <p style={styles.heroMeta}>
          Effective: January 1, 2025 &nbsp;·&nbsp; Last Updated: June 2026
        </p>
      </div>

      <div style={styles.body}>
        {/* 1. Introduction */}
        <div style={styles.section(false)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 01</span>
            <h2 style={styles.sectionTitle}>Introduction</h2>
            <p style={styles.para}>
              Restro OS (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a
              Software-as-a-Service (SaaS) platform built specifically for the restaurant industry.
              We provide digital tools for menu management, order processing, table management, QR
              ordering, staff coordination, and business analytics — helping restaurants of every
              size operate more efficiently and serve their guests better.
            </p>
            <p style={styles.para}>
              This Privacy Policy governs how we collect, use, store, share, and protect your
              personal information when you access our website at restroos.com or use any feature
              of the Restro OS platform. It also explains your rights regarding your data and how
              you can exercise them. We are deeply committed to your privacy. We handle all
              information entrusted to us with care, transparency, and respect — because the trust
              of our restaurant partners and their customers is central to everything we do.
            </p>
            <p style={styles.para}>
              By creating an account or using Restro OS in any capacity, you acknowledge that you
              have read and understood this policy. If you do not agree with any part of it, please
              discontinue use of our services and contact us for assistance.
            </p>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* 2. Information We Collect */}
        <div style={styles.section(true)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 02</span>
            <h2 style={styles.sectionTitle}>Information We Collect</h2>
            <p style={styles.para}>
              We collect several categories of information to deliver and continuously improve our
              platform. The information we collect depends on how you use Restro OS.
            </p>

            <p style={{ ...styles.para, color: '#d0d0d0', fontWeight: 600, marginBottom: 6 }}>
              Account &amp; Registration Information
            </p>
            <p style={styles.para}>
              When you register for Restro OS, we collect your full name, email address, phone
              number, restaurant name, business address, cuisine type, and GST or business
              registration number (where applicable). This information is required to create and
              manage your account and to customise the platform for your specific restaurant setup.
            </p>

            <p style={{ ...styles.para, color: '#d0d0d0', fontWeight: 600, marginBottom: 6 }}>
              Usage Data
            </p>
            <p style={styles.para}>
              As you navigate the platform, we automatically collect information about how you
              interact with it — including pages and features visited, buttons clicked, session
              duration, navigation paths, and error events. This data helps us identify pain points,
              prioritise feature development, and ensure a smooth user experience for all restaurant
              operators.
            </p>

            <p style={{ ...styles.para, color: '#d0d0d0', fontWeight: 600, marginBottom: 6 }}>
              Payment Information
            </p>
            <p style={styles.para}>
              Subscription payments are processed securely through our payment partners —{' '}
              <span style={styles.highlight}>Razorpay</span> and{' '}
              <span style={styles.highlight}>Stripe</span>. We do not store your credit or debit
              card numbers, CVV codes, or full bank account details on our servers at any time. We
              only retain transaction identifiers, billing amounts, payment dates, and invoice
              references needed for accounting and support purposes.
            </p>

            <p style={{ ...styles.para, color: '#d0d0d0', fontWeight: 600, marginBottom: 6 }}>
              Restaurant Operational Data
            </p>
            <p style={styles.para}>
              All data you create within the platform — including your menu items and pricing,
              order records, customer names and contact information you add, table configurations,
              staff profiles, and inventory entries — is your data. We store it on your behalf to
              power the platform&apos;s features. This data belongs to you, not to us.
            </p>

            <p style={{ ...styles.para, color: '#d0d0d0', fontWeight: 600, marginBottom: 6 }}>
              Device &amp; Technical Information
            </p>
            <p style={styles.para}>
              We collect IP addresses, browser type and version, operating system, screen resolution,
              referring URLs, and device identifiers. This information is used for security
              monitoring, fraud detection, and platform compatibility optimisation.
            </p>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* 3. How We Use Information */}
        <div style={styles.section(false)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 03</span>
            <h2 style={styles.sectionTitle}>How We Use Your Information</h2>
            <p style={styles.para}>
              We use the information we collect solely for legitimate business purposes that are
              necessary to operate Restro OS and serve you effectively:
            </p>
            <ul style={styles.ul}>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Providing our services:</strong> To set up
                your restaurant dashboard, manage your subscription, and ensure every feature of
                the platform functions correctly for your team and your guests.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Processing payments &amp; invoices:</strong>{' '}
                To charge subscription fees, generate GST-compliant invoices, handle refunds, and
                maintain accurate billing records in compliance with Indian financial regulations.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Customer support &amp; troubleshooting:</strong>{' '}
                To diagnose technical issues, respond to support tickets, and resolve billing or
                account disputes efficiently. Our support team accesses account data strictly on a
                need-to-know basis.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Product updates &amp; announcements:</strong>{' '}
                To inform you of new features, platform improvements, maintenance windows, and
                important policy changes via email. You may opt out of non-essential communications
                at any time.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Analytics &amp; platform improvement:</strong>{' '}
                To analyse aggregate usage patterns, identify performance bottlenecks, and
                prioritise our product roadmap. Analytics are processed on aggregated, anonymised
                data wherever possible.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Legal &amp; regulatory compliance:</strong>{' '}
                To comply with applicable laws including the IT Act 2000, GST regulations, and
                applicable data protection frameworks. We may retain certain records as required
                by law even after account closure.
              </li>
            </ul>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* 4. Data Sharing */}
        <div style={styles.section(true)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 04</span>
            <h2 style={styles.sectionTitle}>Data Sharing and Disclosure</h2>
            <p style={styles.para}>
              <strong style={{ color: '#ffffff' }}>We never sell your personal data.</strong>{' '}
              We do not trade, rent, or exchange your information with advertisers or any
              third-party commercial entities for their own use. We share data only in the
              following strictly limited circumstances:
            </p>
            <ul style={styles.ul}>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Payment processors (Razorpay, Stripe):</strong>{' '}
                Billing and transaction data is shared with our payment partners solely to process
                your subscription payments. Both are PCI-DSS certified processors.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Email delivery providers:</strong> We use
                transactional email services to send invoices, password reset links, and platform
                notifications. These providers process your email address on our behalf and are
                contractually prohibited from using it for any other purpose.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Analytics tools (Google Analytics):</strong>{' '}
                Anonymised usage data is shared with analytics platforms to help us understand
                platform performance. No personally identifiable information is included in these
                reports.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Legal requirements:</strong> We may disclose
                information if required to do so by law, court order, or a government authority,
                or when we believe in good faith that such disclosure is necessary to protect our
                rights or the safety of users.
              </li>
            </ul>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* 5. Data Security */}
        <div style={styles.section(false)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 05</span>
            <h2 style={styles.sectionTitle}>Data Security</h2>
            <p style={styles.para}>
              We implement a comprehensive, layered security programme to protect your information
              against unauthorised access, alteration, disclosure, or destruction. Our security
              measures include:
            </p>
            <ul style={styles.ul}>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>AES-256 encryption</strong> for all data
                stored in our databases, ensuring that sensitive records are unreadable even in the
                event of a breach.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>SSL/TLS encryption</strong> for all data
                transmitted between your browser or app and our servers, protecting information
                in transit.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Regular automated backups</strong> stored in
                geographically separate locations, ensuring business continuity and data recovery
                capability in the event of infrastructure failure.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Strict access controls</strong> — internal
                team members can access user data only where operationally necessary, governed by
                role-based permissions and audit logging.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>GDPR-aligned practices</strong> including
                data minimisation, purpose limitation, and the right to erasure, even for users
                outside the European Union, as a global baseline standard.
              </li>
            </ul>
            <p style={styles.para}>
              No method of transmission over the internet or electronic storage is 100% secure.
              While we strive to use the best available protections, we cannot guarantee absolute
              security. We will notify affected users promptly in the event of any data breach.
            </p>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* 6. Your Rights */}
        <div style={styles.section(true)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 06</span>
            <h2 style={styles.sectionTitle}>Your Rights</h2>
            <p style={styles.para}>
              You have meaningful rights over your personal data. We respect and honour these rights
              regardless of your location:
            </p>
            <ul style={styles.ul}>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Right of Access:</strong> You may request a
                complete copy of all personal data we hold about you in a readable format at any
                time.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Right to Correction:</strong> If any
                information we hold is inaccurate or outdated, you may request that we correct it.
                Most account data can be updated directly from your dashboard settings.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Right to Deletion (&ldquo;Right to be Forgotten&rdquo;):</strong>{' '}
                You may request deletion of your personal data. Upon account closure, we will
                delete or anonymise your data within 60 days, except where retention is required
                by law (e.g. tax records).
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Data Portability:</strong> You may request
                an export of your restaurant data — including menu items, order history, and
                customer records — in CSV or JSON format.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Opt-out of Marketing:</strong> You may
                unsubscribe from non-essential marketing emails at any time using the unsubscribe
                link included in every email, or by contacting us directly.
              </li>
            </ul>
            <p style={styles.para}>
              To exercise any of these rights, contact us at{' '}
              <span style={styles.highlight}>privacy@restroos.com</span>. We will respond within
              30 days of receiving your request.
            </p>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* 7. Cookies */}
        <div style={styles.section(false)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 07</span>
            <h2 style={styles.sectionTitle}>Cookies Policy</h2>
            <p style={styles.para}>
              We use cookies and similar tracking technologies to enhance your experience on the
              Restro OS platform. Cookies are small text files stored in your browser that allow
              us to recognise returning users and remember preferences.
            </p>
            <p style={styles.para}>
              We use the following types of cookies:
            </p>
            <ul style={styles.ul}>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Essential cookies:</strong> Required for the
                platform to function. These handle authentication sessions, security tokens, and
                core platform state. These cannot be disabled without impairing platform functionality.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Preference cookies:</strong> Store your
                language, theme, and dashboard layout preferences between sessions.
              </li>
              <li style={styles.listItem}>
                <strong style={{ color: '#c8c8c8' }}>Analytics cookies:</strong> Used by Google
                Analytics to collect anonymised usage data that helps us improve the platform.
              </li>
            </ul>
            <p style={styles.para}>
              You can configure your browser to reject all cookies, alert you before a cookie is
              set, or delete existing cookies. Visit your browser&apos;s settings menu for these
              controls. Disabling non-essential cookies will not significantly impact your
              experience, but disabling essential cookies may prevent you from logging in.
            </p>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* 8. Third-Party Links */}
        <div style={styles.section(true)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 08</span>
            <h2 style={styles.sectionTitle}>Third-Party Links</h2>
            <p style={styles.para}>
              Our platform may contain links to external websites, integrations, or partner
              services. These third-party services operate under their own independent privacy
              policies and terms. Restro OS is not responsible for the privacy practices, content,
              or security of any third-party websites. We encourage you to review the privacy
              policy of any external service before sharing personal information with them.
            </p>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* 9. Children's Privacy */}
        <div style={styles.section(false)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 09</span>
            <h2 style={styles.sectionTitle}>Children&apos;s Privacy</h2>
            <p style={styles.para}>
              Restro OS is a professional business management platform intended solely for adults.
              Our services are not directed to, designed for, or intended to be used by individuals
              under the age of 18. We do not knowingly collect personal information from anyone
              under 18. If we become aware that we have inadvertently received data from a minor,
              we will delete that information promptly. If you believe a minor has provided us
              with information, please contact us at privacy@restroos.com immediately.
            </p>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* 10. Changes to Policy */}
        <div style={styles.section(true)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 10</span>
            <h2 style={styles.sectionTitle}>Changes to This Policy</h2>
            <p style={styles.para}>
              We may update this Privacy Policy from time to time as our platform evolves, as
              legal requirements change, or as we introduce new features. When we make material
              changes, we will notify you via email and display a prominent notice on the platform
              dashboard at least 14 days before the changes take effect. The &ldquo;Last
              Updated&rdquo; date at the top of this page always reflects the most recent revision.
              Continued use of Restro OS after changes take effect constitutes your acceptance of
              the revised policy. We encourage you to review this page periodically.
            </p>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* 11. Contact Us */}
        <div style={styles.section(false)}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionLabel}>Section 11</span>
            <h2 style={styles.sectionTitle}>Contact Us</h2>
            <p style={styles.para}>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data handling practices, our privacy team is here to help. We take all privacy
              inquiries seriously and commit to responding within 30 business days.
            </p>
            <div style={styles.contactBox}>
              <span style={styles.contactEmail}>privacy@restroos.com</span>
              <p style={styles.contactNote}>Privacy Team &mdash; Restro OS</p>
              <p style={{ ...styles.contactNote, marginTop: 4 }}>
                We aim to respond within 30 business days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div style={styles.footer}>
        <p style={{ margin: 0 }}>
          &copy; 2025&ndash;2026 Restro OS. All rights reserved. &nbsp;·&nbsp; This policy is
          effective as of January 1, 2025 and was last revised in June 2026.
        </p>
      </div>
    </div>
  )
}
