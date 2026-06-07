import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — Restro OS | Restaurant Management Software',
  description: 'Read the Restro OS Refund Policy. Learn about our 7-day money-back guarantee, free trial terms, cancellation process, and how to request a refund.',
}

export default function RefundPage() {
  const pageStyle: React.CSSProperties = {
    background: '#080808',
    minHeight: '100vh',
    color: '#e0e0e0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  }

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1200 50%, #0f0f0f 100%)',
    borderBottom: '1px solid #2a2000',
    padding: '60px 20px 52px',
  }

  const headerInnerStyle: React.CSSProperties = {
    maxWidth: 900,
    margin: '0 auto',
  }

  const headerTagStyle: React.CSSProperties = {
    display: 'inline-block',
    background: 'rgba(200, 151, 42, 0.12)',
    border: '1px solid rgba(200, 151, 42, 0.3)',
    color: '#c8972a',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '5px 14px',
    borderRadius: 20,
    marginBottom: 18,
  }

  const headerTitleStyle: React.CSSProperties = {
    fontSize: 40,
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: 10,
    lineHeight: 1.15,
  }

  const headerMetaStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#555',
    marginBottom: 16,
  }

  const headerDescStyle: React.CSSProperties = {
    fontSize: 16,
    color: '#888',
    maxWidth: 600,
    lineHeight: 1.65,
  }

  const bodyStyle: React.CSSProperties = {
    maxWidth: 900,
    margin: '0 auto',
    padding: '48px 20px 80px',
    display: 'grid',
    gridTemplateColumns: '200px minmax(0, 1fr)',
    gap: 48,
    alignItems: 'start',
  }

  const tocStyle: React.CSSProperties = {
    position: 'sticky' as const,
    top: 24,
  }

  const tocTitleStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#555',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 12,
  }

  const tocListStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  }

  const tocItemStyle: React.CSSProperties = {
    marginBottom: 4,
  }

  const tocLinkStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: '#666',
    textDecoration: 'none',
    padding: '5px 10px',
    borderRadius: 6,
    borderLeft: '2px solid transparent',
    lineHeight: 1.4,
    transition: 'color 0.2s',
  }

  const tocActiveLinkStyle: React.CSSProperties = {
    ...tocLinkStyle,
    color: '#c8972a',
    borderLeftColor: '#c8972a',
    background: 'rgba(200, 151, 42, 0.06)',
  }

  const contentStyle: React.CSSProperties = {
    minWidth: 0,
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: 48,
    scrollMarginTop: 24,
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: '#c8972a',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }

  const sectionNumStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: 6,
    background: 'rgba(200, 151, 42, 0.15)',
    border: '1px solid rgba(200, 151, 42, 0.3)',
    fontSize: 12,
    fontWeight: 700,
    color: '#c8972a',
    flexShrink: 0,
  }

  const paraStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 1.75,
    marginBottom: 14,
  }

  const dividerStyle: React.CSSProperties = {
    borderTop: '1px solid #1a1a1a',
    marginBottom: 48,
  }

  const highlightBoxStyle: React.CSSProperties = {
    background: 'rgba(200, 151, 42, 0.06)',
    border: '1px solid rgba(200, 151, 42, 0.18)',
    borderRadius: 10,
    padding: '16px 20px',
    marginBottom: 16,
  }

  const highlightTextStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#c8a850',
    lineHeight: 1.65,
    fontWeight: 500,
  }

  const warningBoxStyle: React.CSSProperties = {
    background: 'rgba(200, 80, 50, 0.06)',
    border: '1px solid rgba(200, 80, 50, 0.2)',
    borderRadius: 10,
    padding: '16px 20px',
    marginBottom: 16,
  }

  const warningTextStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#c07060',
    lineHeight: 1.65,
  }

  const bulletStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 14px 0',
  }

  const bulletItemStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 1.65,
    paddingLeft: 20,
    position: 'relative' as const,
    marginBottom: 8,
  }

  const contactCardStyle: React.CSSProperties = {
    background: '#0f0f0f',
    border: '1px solid #222',
    borderRadius: 12,
    padding: '24px 28px',
    marginTop: 48,
  }

  const contactTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 8,
  }

  const contactDetailStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#888',
    lineHeight: 1.65,
  }

  const contactEmailStyle: React.CSSProperties = {
    color: '#c8972a',
    textDecoration: 'none',
    fontWeight: 600,
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerInnerStyle}>
          <div style={headerTagStyle}>Legal</div>
          <h1 style={headerTitleStyle}>Refund Policy</h1>
          <div style={headerMetaStyle}>Effective Date: January 1, 2025 &nbsp;·&nbsp; Last Updated: June 1, 2026</div>
          <p style={headerDescStyle}>
            At Restro OS, we believe in fair, transparent billing practices. This policy explains
            exactly when and how you can get a refund, what is not refundable, and how to reach
            us if you ever have a billing concern.
          </p>
        </div>
      </div>

      {/* Two-column body */}
      <div style={bodyStyle}>
        {/* Sidebar TOC */}
        <aside style={tocStyle}>
          <div style={tocTitleStyle}>Contents</div>
          <ul style={tocListStyle}>
            {[
              { num: '1', label: 'Introduction', href: '#introduction' },
              { num: '2', label: 'Subscription Refunds', href: '#subscription-refund' },
              { num: '3', label: 'Free Trial Terms', href: '#free-trial' },
              { num: '4', label: 'Non-Refundable Items', href: '#non-refundable' },
              { num: '5', label: 'How to Request', href: '#how-to-request' },
              { num: '6', label: 'Disputed Charges', href: '#disputes' },
              { num: '7', label: 'Cancellation Policy', href: '#cancellation' },
              { num: '8', label: 'Policy Changes', href: '#changes' },
              { num: '9', label: 'Contact Us', href: '#contact' },
            ].map((item, i) => (
              <li key={item.num} style={tocItemStyle}>
                <a
                  href={item.href}
                  style={i === 0 ? tocActiveLinkStyle : tocLinkStyle}
                >
                  {item.num}. {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main style={contentStyle}>

          {/* 1. Introduction */}
          <section id="introduction" style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <span style={sectionNumStyle}>1</span>
              Introduction
            </h2>
            <p style={paraStyle}>
              Restro OS ("we," "us," or "our") is committed to fair, transparent refund practices
              that put restaurant owners first. We understand that choosing new software is a
              significant decision, and we want you to feel completely confident in that choice.
              This Refund Policy outlines the conditions under which we issue refunds, the process
              for requesting one, and the circumstances in which a refund may not be applicable.
            </p>
            <p style={paraStyle}>
              We designed our refund terms to be straightforward and human — not buried in
              legalese. If you ever feel that a charge was unfair or unexpected, our support
              team is your first point of contact, and we will always try to resolve the matter
              reasonably. Our goal is a long-term relationship built on trust, not a single
              transaction.
            </p>
            <p style={paraStyle}>
              By subscribing to any Restro OS plan, you acknowledge that you have read,
              understood, and agreed to the terms outlined in this Refund Policy, as well as
              our Terms of Service and Privacy Policy. This policy is subject to applicable
              Indian consumer protection laws including the Consumer Protection Act, 2019.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* 2. Subscription Refund Policy */}
          <section id="subscription-refund" style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <span style={sectionNumStyle}>2</span>
              Subscription Refund Policy
            </h2>

            <div style={highlightBoxStyle}>
              <div style={highlightTextStyle}>
                7-Day Money-Back Guarantee: New subscribers on any paid Restro OS plan can
                request a full refund within 7 calendar days of their first payment — no
                questions asked.
              </div>
            </div>

            <p style={paraStyle}>
              We offer a <strong style={{ color: '#e0e0e0' }}>7-day full money-back guarantee</strong> for
              all new paying subscribers. If you sign up for a paid plan and decide within
              the first seven calendar days that Restro OS is not the right fit for your
              restaurant, contact us at{' '}
              <a href="mailto:support@restroos.com" style={{ color: '#c8972a' }}>support@restroos.com</a>{' '}
              and we will issue a complete refund to your original payment method — no
              forms, no lengthy verification, no friction.
            </p>
            <p style={paraStyle}>
              After the initial 7-day window, subscription fees are generally non-refundable
              for the current billing period. However, if you are on an annual plan and request
              a cancellation after 7 days but before 30 days, we may offer a pro-rated refund
              for the unused months at our discretion, minus a processing fee of ₹499. Pro-rated
              refunds are evaluated on a case-by-case basis and are not guaranteed beyond the
              first 7 days.
            </p>
            <p style={paraStyle}>
              Qualifying circumstances for refunds outside the 7-day window include: extended
              platform outages lasting more than 48 hours caused by our infrastructure, billing
              errors where you were charged an incorrect amount, or duplicate charges resulting
              from a payment gateway error. In such cases, we will issue a full correction
              promptly.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* 3. Free Trial Terms */}
          <section id="free-trial" style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <span style={sectionNumStyle}>3</span>
              Free Trial Terms
            </h2>
            <p style={paraStyle}>
              Restro OS offers a <strong style={{ color: '#e0e0e0' }}>14-day free trial</strong> on
              all plans, with no payment information required to get started. During the trial
              period, you have full access to all features of the plan you selected. No charges
              are applied during the trial, and no credit card or UPI details are collected
              until you voluntarily choose to upgrade.
            </p>
            <p style={paraStyle}>
              At the end of your 14-day free trial, your account will automatically switch to
              a limited free tier unless you actively choose to subscribe to a paid plan. You
              will receive reminder emails at Day 10 and Day 13 of your trial. There are no
              surprise charges — you will never be billed automatically after a trial without
              your explicit action and consent.
            </p>
            <p style={paraStyle}>
              Data entered during the free trial (menu items, staff profiles, orders, analytics)
              is retained for 30 days after trial expiry. If you subscribe within that period,
              all your data is immediately restored. Free trial periods cannot be extended, but
              if you face technical issues that impacted your trial experience, contact support
              and we will evaluate your request fairly.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* 4. Non-Refundable Items */}
          <section id="non-refundable" style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <span style={sectionNumStyle}>4</span>
              Non-Refundable Items
            </h2>

            <div style={warningBoxStyle}>
              <div style={warningTextStyle}>
                The following services and fees are non-refundable once work has commenced
                or third-party costs have been incurred on your behalf.
              </div>
            </div>

            <p style={paraStyle}>The following items are explicitly non-refundable:</p>

            <ul style={bulletStyle}>
              {[
                'One-time onboarding and setup fees, once the setup session has been completed by our team.',
                'Custom development work, including custom menu designs, branded homepages, or bespoke feature requests.',
                'Third-party integration fees, including payment gateway setup charges, SMS gateway credits, or API access fees paid to external providers.',
                'Add-on purchases such as additional outlet licenses or extra SMS/WhatsApp notification credits that have been consumed.',
                'Subscription fees for months already past — refunds only apply to future, unused billing periods in applicable cases.',
              ].map((item, i) => (
                <li key={i} style={bulletItemStyle}>
                  <span style={{ position: 'absolute' as const, left: 0, color: '#c8972a' }}>•</span>
                  {item}
                </li>
              ))}
            </ul>

            <p style={paraStyle}>
              If you are unsure whether a specific charge qualifies for a refund before
              making a purchase, please contact our support team at{' '}
              <a href="mailto:support@restroos.com" style={{ color: '#c8972a' }}>support@restroos.com</a>{' '}
              and we will clarify in writing before any payment is processed.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* 5. How to Request a Refund */}
          <section id="how-to-request" style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <span style={sectionNumStyle}>5</span>
              How to Request a Refund
            </h2>
            <p style={paraStyle}>
              Requesting a refund is simple and does not require you to fill out lengthy
              forms or navigate a support queue. To initiate a refund, send an email to{' '}
              <a href="mailto:support@restroos.com" style={{ color: '#c8972a' }}>support@restroos.com</a>{' '}
              with the subject line "Refund Request – [Your Restaurant Name]". Include your
              registered email address, your subscription plan, the amount charged, the
              transaction date, and a brief reason for the request.
            </p>
            <p style={paraStyle}>
              Our billing team will acknowledge your request within one business day and
              will complete the review within <strong style={{ color: '#e0e0e0' }}>3–5 business days</strong>.
              If your request qualifies under this policy, the refund will be initiated
              to your original payment method — credit/debit card, UPI, or net banking —
              and will reflect in your account within 5–7 additional banking days depending
              on your bank. You will receive a confirmation email once the refund is processed.
            </p>
            <p style={paraStyle}>
              You may also reach us by phone at +91 88888 88888 (Monday–Saturday, 9 AM to
              7 PM IST) or through the live chat option on our website. For the fastest
              resolution, email is preferred as it creates a written record of your request.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* 6. Disputed Charges */}
          <section id="disputes" style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <span style={sectionNumStyle}>6</span>
              Disputed Charges
            </h2>
            <p style={paraStyle}>
              If you notice a charge on your statement that you do not recognize or believe
              to be incorrect, please contact us before initiating a chargeback through your
              bank. Most billing discrepancies — such as duplicate charges, wrong plan amounts,
              or failed downgrade requests — can be resolved quickly and directly with our
              support team, often within 24 hours.
            </p>
            <p style={paraStyle}>
              To raise a billing dispute, email{' '}
              <a href="mailto:support@restroos.com" style={{ color: '#c8972a' }}>support@restroos.com</a>{' '}
              with your transaction ID, the disputed amount, the date of charge, and a clear
              description of the issue. Our billing team will investigate and respond with
              findings within 3 business days. If the dispute is valid, we will issue a
              correction or refund immediately.
            </p>
            <p style={paraStyle}>
              If you file a chargeback with your bank or payment provider without first
              contacting us, we may be required to suspend your account during the dispute
              investigation period as required by our payment processor agreements. We always
              encourage direct communication first — it is faster for you and more effective
              for everyone involved.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* 7. Cancellation Policy */}
          <section id="cancellation" style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <span style={sectionNumStyle}>7</span>
              Cancellation Policy
            </h2>
            <div style={highlightBoxStyle}>
              <div style={highlightTextStyle}>
                You can cancel your Restro OS subscription at any time — no lock-in contracts,
                no early termination fees, no complicated processes.
              </div>
            </div>
            <p style={paraStyle}>
              To cancel, log into your Restro OS dashboard, go to Settings → Billing, and
              select "Cancel Subscription." Alternatively, email us at{' '}
              <a href="mailto:support@restroos.com" style={{ color: '#c8972a' }}>support@restroos.com</a>{' '}
              and we will process the cancellation within one business day. You will receive
              a confirmation email as soon as the cancellation is recorded.
            </p>
            <p style={paraStyle}>
              Upon cancellation, your paid access continues until the end of your current
              billing period. If you are on a monthly plan and cancel mid-month, you retain
              full access for the remainder of that calendar month. If you are on an annual
              plan, you retain access until the annual period ends. We do not charge any
              cancellation fees, and we will not attempt to re-bill you after your cancellation
              is confirmed.
            </p>
            <p style={paraStyle}>
              After your subscription ends, your account data is retained in read-only mode
              for 60 days, giving you time to export invoices, analytics reports, or menu data.
              After 60 days, data is permanently deleted in accordance with our Privacy Policy.
              If you change your mind and wish to reactivate, simply log back in and choose
              a plan — your data will be restored instantly if you reactivate within the
              60-day window.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* 8. Changes to This Policy */}
          <section id="changes" style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <span style={sectionNumStyle}>8</span>
              Changes to This Policy
            </h2>
            <p style={paraStyle}>
              Restro OS reserves the right to update or modify this Refund Policy at any
              time. When we make material changes, we will notify active subscribers by
              email at least 14 days before the changes take effect. The updated policy will
              also be published at{' '}
              <a href="/refund" style={{ color: '#c8972a' }}>restroos.com/refund</a>{' '}
              with the revised effective date. Continued use of the platform after the
              effective date constitutes acceptance of the updated policy. We encourage
              you to review this page periodically.
            </p>
          </section>

          <div style={dividerStyle} />

          {/* 9. Contact Information */}
          <section id="contact" style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <span style={sectionNumStyle}>9</span>
              Contact Information
            </h2>
            <p style={paraStyle}>
              For any questions about this Refund Policy, billing concerns, or to initiate
              a refund request, please contact our support team using the details below.
              We are committed to responding to all billing-related queries promptly.
            </p>
          </section>

          <div style={contactCardStyle}>
            <div style={contactTitleStyle}>Restro OS Billing & Support</div>
            <div style={contactDetailStyle}>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#c0c0c0' }}>Email:</strong>{' '}
                <a href="mailto:support@restroos.com" style={contactEmailStyle}>
                  support@restroos.com
                </a>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#c0c0c0' }}>Phone:</strong>{' '}
                <a href="tel:+918888888888" style={contactEmailStyle}>+91 88888 88888</a>
                {' '}(Mon–Sat, 9 AM – 7 PM IST)
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#c0c0c0' }}>Response Time:</strong>{' '}
                Within 1 business day for all billing queries
              </div>
              <div>
                <strong style={{ color: '#c0c0c0' }}>Registered Address:</strong>{' '}
                Restro OS Technologies Pvt. Ltd., India
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
