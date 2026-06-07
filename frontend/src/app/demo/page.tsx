import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Free Demo - Restro OS | Restaurant Management Software',
  description: 'Book a free 30-minute live demo of Restro OS. See how 500+ restaurants manage orders, billing, tables, and staff with one powerful platform.',
}

export default function DemoPage() {
  const pageStyle: React.CSSProperties = {
    background: '#080808',
    minHeight: '100vh',
    color: '#e0e0e0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  }

  const heroStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1200 50%, #0f0f0f 100%)',
    borderBottom: '1px solid #2a2000',
    padding: '72px 20px 60px',
    textAlign: 'center',
  }

  const heroTagStyle: React.CSSProperties = {
    display: 'inline-block',
    background: 'rgba(200, 151, 42, 0.12)',
    border: '1px solid rgba(200, 151, 42, 0.35)',
    color: '#c8972a',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '6px 16px',
    borderRadius: 20,
    marginBottom: 24,
  }

  const heroTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(28px, 5vw, 52px)',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.15,
    marginBottom: 20,
    maxWidth: 760,
    margin: '0 auto 20px',
  }

  const heroSubStyle: React.CSSProperties = {
    fontSize: 18,
    color: '#a0a0a0',
    maxWidth: 620,
    margin: '0 auto 32px',
    lineHeight: 1.65,
  }

  const heroStatsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: 40,
    flexWrap: 'wrap' as const,
    marginTop: 40,
  }

  const statItemStyle: React.CSSProperties = {
    textAlign: 'center',
  }

  const statNumberStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 32,
    fontWeight: 800,
    color: '#c8972a',
    lineHeight: 1,
  }

  const statLabelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  }

  const mainStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '60px 20px 80px',
  }

  const twoColStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)',
    gap: 56,
    alignItems: 'start',
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 6,
  }

  const sectionSubStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#666',
    marginBottom: 28,
  }

  const benefitItemStyle: React.CSSProperties = {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  }

  const benefitIconStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'rgba(200, 151, 42, 0.12)',
    border: '1px solid rgba(200, 151, 42, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 16,
  }

  const benefitTextStyle: React.CSSProperties = {
    flex: 1,
  }

  const benefitTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: 4,
  }

  const benefitDescStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#888',
    lineHeight: 1.6,
  }

  const dividerStyle: React.CSSProperties = {
    borderTop: '1px solid #1e1e1e',
    margin: '36px 0',
  }

  const socialProofStyle: React.CSSProperties = {
    background: 'rgba(200, 151, 42, 0.06)',
    border: '1px solid rgba(200, 151, 42, 0.18)',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 28,
  }

  const socialProofTitleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: '#c8972a',
    marginBottom: 16,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }

  const testimonialStyle: React.CSSProperties = {
    borderTop: '1px solid rgba(200, 151, 42, 0.12)',
    paddingTop: 14,
    marginTop: 14,
  }

  const testimonialTextStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#c0c0c0',
    lineHeight: 1.6,
    fontStyle: 'italic',
    marginBottom: 6,
  }

  const testimonialAuthorStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#666',
    fontWeight: 600,
  }

  const formCardStyle: React.CSSProperties = {
    background: '#0f0f0f',
    border: '1px solid #222',
    borderRadius: 16,
    padding: '36px 32px',
    position: 'sticky' as const,
    top: 24,
  }

  const formTitleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  }

  const formSubtitleStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 1.5,
  }

  const formGroupStyle: React.CSSProperties = {
    marginBottom: 16,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#999',
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: 8,
    padding: '11px 14px',
    fontSize: 14,
    color: '#e0e0e0',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    cursor: 'pointer',
  }

  const submitBtnStyle: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(135deg, #c8972a, #e8b84b)',
    border: 'none',
    borderRadius: 8,
    padding: '14px',
    fontSize: 15,
    fontWeight: 700,
    color: '#000',
    cursor: 'pointer',
    marginTop: 8,
    letterSpacing: '0.03em',
  }

  const trialNoteStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: 13,
    color: '#555',
    marginTop: 16,
    lineHeight: 1.5,
  }

  const trialLinkStyle: React.CSSProperties = {
    color: '#c8972a',
    textDecoration: 'none',
    fontWeight: 600,
  }

  const urgencyBadgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(220, 80, 50, 0.1)',
    border: '1px solid rgba(220, 80, 50, 0.25)',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 24,
    fontSize: 13,
    color: '#e07060',
    fontWeight: 500,
  }

  const faqSectionStyle: React.CSSProperties = {
    marginTop: 72,
    borderTop: '1px solid #1e1e1e',
    paddingTop: 56,
  }

  const faqTitleStyle: React.CSSProperties = {
    fontSize: 26,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 32,
    textAlign: 'center',
  }

  const faqGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  }

  const faqCardStyle: React.CSSProperties = {
    background: '#0f0f0f',
    border: '1px solid #222',
    borderRadius: 12,
    padding: '24px 24px',
  }

  const faqQStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 700,
    color: '#c8972a',
    marginBottom: 10,
  }

  const faqAStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#888',
    lineHeight: 1.65,
  }

  const contactSectionStyle: React.CSSProperties = {
    marginTop: 64,
    background: 'linear-gradient(135deg, #0f0f0f, #1a1200, #0f0f0f)',
    border: '1px solid #2a2000',
    borderRadius: 16,
    padding: '40px 36px',
    textAlign: 'center',
  }

  const contactTitleStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 8,
  }

  const contactSubStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  }

  const contactLinksStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: 32,
    flexWrap: 'wrap' as const,
  }

  const contactLinkStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#c8972a',
    textDecoration: 'none',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }

  return (
    <div style={pageStyle}>
      {/* Hero */}
      <section style={heroStyle}>
        <div style={heroTagStyle}>Free Live Demo</div>
        <h1 style={heroTitleStyle}>
          See Restro OS in Action —<br />Live Demo in 30 Minutes
        </h1>
        <p style={heroSubStyle}>
          Watch how 500+ restaurants cut costs, increase revenue, and run smoother operations
          with our all-in-one platform. No pressure. No credit card. Just a clear picture
          of what your restaurant can become.
        </p>

        <div style={heroStatsStyle}>
          <div style={statItemStyle}>
            <span style={statNumberStyle}>500+</span>
            <span style={statLabelStyle}>Restaurants Live</span>
          </div>
          <div style={statItemStyle}>
            <span style={statNumberStyle}>30 min</span>
            <span style={statLabelStyle}>Demo Duration</span>
          </div>
          <div style={statItemStyle}>
            <span style={statNumberStyle}>100%</span>
            <span style={statLabelStyle}>Free, No Obligation</span>
          </div>
          <div style={statItemStyle}>
            <span style={statNumberStyle}>14 days</span>
            <span style={statLabelStyle}>Free Trial After</span>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div style={mainStyle}>
        <div style={twoColStyle}>
          {/* Left: Benefits + Social Proof */}
          <div>
            <h2 style={sectionTitleStyle}>What You Will See in the Demo</h2>
            <p style={sectionSubStyle}>
              A real walkthrough of a live restaurant account — no slides, no recordings.
            </p>

            {/* Benefit 1 */}
            <div style={benefitItemStyle}>
              <div style={benefitIconStyle}>🍽️</div>
              <div style={benefitTextStyle}>
                <div style={benefitTitleStyle}>Live Menu Management and Real-Time Order Flow</div>
                <div style={benefitDescStyle}>
                  Watch how your team can update menu items, toggle availability, and manage
                  incoming orders across dine-in, takeaway, and delivery channels — all from
                  one unified screen without switching between apps or calling the kitchen.
                </div>
              </div>
            </div>

            {/* Benefit 2 */}
            <div style={benefitItemStyle}>
              <div style={benefitIconStyle}>🧾</div>
              <div style={benefitTextStyle}>
                <div style={benefitTitleStyle}>One-Click Billing with GST Invoices</div>
                <div style={benefitDescStyle}>
                  See how Restro OS generates GST-compliant tax invoices instantly with a
                  single click. Supports split bills, multiple payment modes, and automatic
                  rounding — saving your cashier 3–5 minutes on every single table transaction.
                </div>
              </div>
            </div>

            {/* Benefit 3 */}
            <div style={benefitItemStyle}>
              <div style={benefitIconStyle}>📅</div>
              <div style={benefitTextStyle}>
                <div style={benefitTitleStyle}>Table Booking System Setup</div>
                <div style={benefitDescStyle}>
                  Explore our smart reservation management module. Customers book online through
                  your custom link or QR code; your host sees real-time table availability and
                  can instantly confirm, reschedule, or seat walk-ins without double-booking.
                </div>
              </div>
            </div>

            {/* Benefit 4 */}
            <div style={benefitItemStyle}>
              <div style={benefitIconStyle}>📊</div>
              <div style={benefitTextStyle}>
                <div style={benefitTitleStyle}>Analytics Dashboard Walkthrough</div>
                <div style={benefitDescStyle}>
                  Dive into real restaurant data — daily revenue, best-selling items, peak hours,
                  average order value, and staff performance metrics. Understand exactly where
                  your profit comes from and where you are losing money each day without guesswork.
                </div>
              </div>
            </div>

            {/* Benefit 5 */}
            <div style={benefitItemStyle}>
              <div style={benefitIconStyle}>👥</div>
              <div style={benefitTextStyle}>
                <div style={benefitTitleStyle}>Staff Management and Role Assignment</div>
                <div style={benefitDescStyle}>
                  See how to add staff, assign roles such as Manager, Cashier, Waiter, or Kitchen,
                  and control exactly what each person can access. Track attendance, shift timings,
                  and individual performance — giving you full oversight without micromanaging your team.
                </div>
              </div>
            </div>

            {/* Benefit 6 */}
            <div style={benefitItemStyle}>
              <div style={benefitIconStyle}>🎨</div>
              <div style={benefitTextStyle}>
                <div style={benefitTitleStyle}>Custom Branding and Restaurant Homepage Setup</div>
                <div style={benefitDescStyle}>
                  Discover how to publish a professional restaurant homepage with your logo, brand
                  colors, photo gallery, and online menu — in under 10 minutes. No developers
                  needed. Your QR-enabled digital presence is included free with every Restro OS plan.
                </div>
              </div>
            </div>

            <div style={dividerStyle} />

            {/* Social Proof */}
            <div style={socialProofStyle}>
              <div style={socialProofTitleStyle}>Join 500+ Restaurants Already Using Restro OS</div>

              <div>
                <div style={testimonialTextStyle}>
                  "Restro OS transformed how we manage our two outlets. Billing used to take
                  5 minutes per table; now it takes 30 seconds. Our monthly revenue is up 18%
                  just from faster table turnover."
                </div>
                <div style={testimonialAuthorStyle}>— Arjun Mehta, Owner · Spice Garden, Pune</div>
              </div>

              <div style={testimonialStyle}>
                <div style={testimonialTextStyle}>
                  "The analytics dashboard alone is worth the subscription. I finally know
                  which dishes are actually profitable and which ones I was selling at a loss.
                  It paid for itself in the first week."
                </div>
                <div style={testimonialAuthorStyle}>— Priya Sharma, Manager · The Urban Plate, Bangalore</div>
              </div>

              <div style={testimonialStyle}>
                <div style={testimonialTextStyle}>
                  "We run a cloud kitchen with 5 brands and Restro OS handles all of them from
                  one dashboard. The demo took 25 minutes and we signed up the same evening.
                  Genuinely the best software decision we have made."
                </div>
                <div style={testimonialAuthorStyle}>— Rahul Desai, Founder · QuickBite Cloud Kitchen, Mumbai</div>
              </div>
            </div>

            {/* Why Book a Demo */}
            <h3 style={{ ...sectionTitleStyle, fontSize: 18, marginTop: 8 }}>
              Why Book a Demo Instead of Just Signing Up?
            </h3>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, marginBottom: 16 }}>
              Restro OS is a powerful platform with dozens of features built specifically for
              Indian restaurants. A demo ensures you get a personalized walkthrough tailored
              to your restaurant type — whether you run a QSR, fine dining, cloud kitchen, or
              a multi-outlet chain. Our product specialists will answer your specific questions,
              show you setup for your city's tax requirements, and help you understand exactly
              how fast you can go live.
            </p>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7 }}>
              Most restaurants that attend a demo go live within 48 hours. The 30 minutes you
              invest in a demo will save you weeks of trial-and-error and thousands of rupees
              in inefficiencies. There is no sales pressure — if Restro OS is not the right
              fit, our specialist will tell you so honestly.
            </p>
          </div>

          {/* Right: Form */}
          <div>
            <div style={formCardStyle}>
              <div style={urgencyBadgeStyle}>
                <span>🔴</span>
                <span>Limited demo slots available this week — book yours now</span>
              </div>

              <div style={formTitleStyle}>Book Your Free Demo</div>
              <div style={formSubtitleStyle}>
                Fill in your details and our team will reach out within 2 hours
                to schedule your personalized walkthrough.
              </div>

              <form>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Your Name *</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="name"
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Restaurant Name *</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="restaurant"
                    placeholder="e.g. Spice Garden"
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    style={inputStyle}
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>City *</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="city"
                    placeholder="e.g. Mumbai, Delhi, Pune"
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Restaurant Size *</label>
                  <select style={selectStyle} name="size" required>
                    <option value="">Select number of outlets</option>
                    <option value="1">1 outlet (Single location)</option>
                    <option value="2-5">2–5 outlets (Small chain)</option>
                    <option value="5+">5+ outlets (Multi-brand / Large chain)</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Best Time to Call *</label>
                  <select style={selectStyle} name="time" required>
                    <option value="">Select preferred time</option>
                    <option value="morning">Morning (9 AM – 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM – 3 PM)</option>
                    <option value="evening">Evening (4 PM – 7 PM)</option>
                    <option value="anytime">Anytime works for me</option>
                  </select>
                </div>

                <button type="submit" style={submitBtnStyle}>
                  Book My Free Demo →
                </button>
              </form>

              <div style={trialNoteStyle}>
                Or start immediately with our{' '}
                <a href="/signup" style={trialLinkStyle}>
                  14-day free trial
                </a>
                {' '}— no credit card required.
              </div>

              <div style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid #1e1e1e',
                display: 'flex',
                gap: 16,
                justifyContent: 'center',
                flexWrap: 'wrap' as const,
              }}>
                {['No credit card needed', 'Free cancellation', 'Setup support included'].map(item => (
                  <div key={item} style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#c8972a' }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={faqSectionStyle}>
          <h2 style={faqTitleStyle}>Common Questions About Our Demo</h2>
          <div style={faqGridStyle}>
            <div style={faqCardStyle}>
              <div style={faqQStyle}>Is the demo completely free?</div>
              <div style={faqAStyle}>
                Yes — 100% free with no obligation. There is no sales pitch and no pressure
                to sign up. Our product specialists are here to show you the platform and
                answer your questions honestly. If Restro OS is not the right fit for your
                restaurant, we will tell you. We only want happy, long-term customers.
              </div>
            </div>

            <div style={faqCardStyle}>
              <div style={faqQStyle}>How long does the demo take?</div>
              <div style={faqAStyle}>
                A standard demo runs 25–30 minutes and covers all core features including
                billing, menu management, analytics, and staff management. If you have
                specific questions about multi-outlet management, integrations, or custom
                branding, we can extend it slightly. We respect your time and always keep
                it focused and efficient.
              </div>
            </div>

            <div style={faqCardStyle}>
              <div style={faqQStyle}>What do I need to attend the demo?</div>
              <div style={faqAStyle}>
                Nothing special — just a phone or laptop and 30 free minutes. Our specialist
                will call you at your preferred time and either walk you through a screen share
                or send you a live link. No software installation required. You can also invite
                your co-owner or manager to join the call for a shared decision.
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div style={contactSectionStyle}>
          <div style={contactTitleStyle}>Prefer to Reach Us Directly?</div>
          <div style={contactSubStyle}>
            Our team is available Monday to Saturday, 9 AM to 7 PM IST.
            We typically respond within 2 hours.
          </div>
          <div style={contactLinksStyle}>
            <a href="mailto:support@restroos.com" style={contactLinkStyle}>
              <span>✉</span> support@restroos.com
            </a>
            <a href="tel:+918888888888" style={contactLinkStyle}>
              <span>📞</span> +91 88888 88888
            </a>
            <a href="/contact" style={contactLinkStyle}>
              <span>💬</span> Live Chat Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
