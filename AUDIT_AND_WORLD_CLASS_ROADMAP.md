# Restro OS — Website Audit & World-Class Improvement Roadmap

**Document purpose:** Is website ko check kiya gaya hai — kya hai, kya missing hai, aur kya add/improve karenge to ye world-class ban sakti hai. Sab ek hi file mein.

---

## 1. CURRENT STATE — Abhi Kya Hai

### 1.1 Tech Stack
| Layer    | Stack                          |
|----------|--------------------------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind, Framer Motion, Recharts, Axios |
| Backend  | Node.js, Express, Mongoose, MongoDB |
| Auth     | JWT, bcrypt |
| Payments | Razorpay |
| Notifications | WhatsApp (optional), Nodemailer (email config present) |

### 1.2 User Roles & Panels
- **Super Admin** — Platform owner: restaurants, plans, subscriptions, analytics, users (sab dikhte hain)
- **Master Admin** — Platform management: same features, Super Admin users hide
- **Rental Admin** — Per-restaurant: orders, menu, bookings, billing, staff/users, settings, theme
- **Customer** — Signup/login, menu, cart, checkout, booking

### 1.3 Customer-Facing Features
- Home, Menu (filters, categories, restaurant slug support), Cart, Checkout (Razorpay + COD)
- Table booking (slot-based)
- Restaurant-specific public page: `/r/[slug]`
- Login/Signup (restaurant context)
- Language switch (Hindi/English)
- Hero carousel, reviews, basic SEO (metadata, schema)

### 1.4 Admin Features (Rental)
- Dashboard, Orders, Menu CRUD, Bookings, Billing (offline/from-order)
- Hero images, Payments history, Revenue, Customers, Staff & Users, Reviews, Analytics, Settings (theme, Razorpay, WhatsApp)

### 1.5 Platform (Super/Master)
- Restaurants CRUD, per-restaurant features toggle, status, reset admin password
- Plans, Subscriptions, Platform analytics (revenue, per-restaurant)
- Users list (role-based visibility)

### 1.6 Backend
- REST API, JWT auth, role-based middleware (super/master/rental)
- Rate limiting, health check, validation middleware (menu, booking)
- Multi-tenant: restaurantId/slug in menu, orders, users
- File upload (images), static serve for uploads

---

## 2. KYA MISSING HAI (Gaps)

### 2.1 Testing
- **Unit tests** — Backend/frontend par koi test suite nahi (no Jest/Vitest/Cypress in project scripts)
- **API tests** — Auth, orders, bookings ke liye automated tests nahi
- **E2E tests** — User flows (order, booking, admin actions) verify nahi ho rahe

### 2.2 Security & Hardening
- **Input sanitization** — Validation hai par XSS/noSQL injection ke liye explicit sanitization (e.g. mongo-sanitize, helmet) nahi
- **CORS** — Abhi sab origins allow ho sakte hain; production ke liye allowlist missing
- **Helmet** — Security headers (X-Frame-Options, CSP, etc.) set nahi
- **Env validation** — Startup par required env vars check nahi (e.g. JWT_SECRET, DB)
- **Refresh token** — Sirf access token; refresh flow nahi
- **Password policy** — Min length/strength enforce ho raha hai par complexity (uppercase, number, symbol) optional

### 2.3 DevOps & Reliability
- **Logging** — Sirf console.error; structured logging (Winston/Pino) + log levels nahi
- **Monitoring / APM** — Uptime, latency, error tracking (e.g. Sentry, DataDog) nahi
- **.env.example** — Backend/frontend ke liye documented env example file missing
- **Docker** — Dockerfile / docker-compose nahi (local/prod parity ke liye useful)
- **CI/CD** — GitHub Actions / pipeline for test + build + deploy nahi
- **Database backups** — Strategy/documentation nahi

### 2.4 UX & Frontend
- **PWA** — Offline support, install prompt, service worker nahi
- **Sitemap / robots.txt** — Dynamic sitemap (e.g. /r/[slug]) aur robots.txt generate nahi
- **Error boundaries** — React error boundaries global/full-page nahi
- **Loading states** — Kahi-kahi skeleton/loading consistent nahi
- **Image optimization** — `<img>` use ho raha hai; Next.js `Image` component se LCP improve ho sakta
- **Accessibility** — Focus management, ARIA, keyboard nav audit nahi kiya
- **Mobile** — Responsive hai par touch targets, bottom nav (mobile-first) improve ho sakta

### 2.5 Business & Product
- **Email notifications** — Config hai par order/booking confirmation emails flow unclear
- **Inventory / stock** — Menu items ke liye stock tracking nahi
- **Discounts / coupons** — Promo codes, percentage off nahi
- **Loyalty / rewards** — Points, repeat customer rewards nahi
- **Multi-currency** — Restaurant-level currency hai par checkout pe multi-currency display/switch limited
- **Reports export** — CSV/PDF export for orders, revenue, users nahi
- **Audit log** — Kon, kab, kya change kiya (admin actions) log nahi
- **2FA** — Admin login par two-factor nahi

### 2.6 API & Data
- **API versioning** — e.g. /api/v1/ nahi; future breaking changes ke liye plan nahi
- **Pagination** — Kahi list APIs par cursor/offset standard nahi
- **API docs** — Swagger/OpenAPI nahi
- **Caching** — Redis ya in-memory cache for menu/restaurant data nahi
- **Idempotency** — Payment/order create ke liye idempotency keys nahi (duplicate submit risk)

---

## 3. WORLD-CLASS BANANE KE LIYE KYA ADD / IMPROVE KAREIN

### 3.1 Security (Priority: High)
| Item | Action |
|------|--------|
| Helmet | `helmet()` middleware add karein (security headers) |
| CORS allowlist | Production me `origin: [NEXT_PUBLIC_APP_URL]` jaisa restrict karein |
| Input sanitization | `mongo-sanitize` ya validator + sanitizer for all user inputs |
| Env validation | Startup par `zod`/`joi` se required env validate karein |
| Refresh token | Optional: refresh token flow + rotation for long sessions |
| 2FA | Admin/Super admin login par TOTP (e.g. speakeasy + QR) |

### 3.2 Testing (Priority: High)
| Item | Action |
|------|--------|
| Backend unit tests | Jest/Vitest + auth, user, order, booking controllers |
| API integration tests | Supertest se critical routes (login, create order, create booking) |
| Frontend unit tests | React Testing Library for critical components (Cart, Checkout, Menu) |
| E2E | Playwright/Cypress — guest order, booking, admin login + one action |
| CI | GitHub Actions: lint → test → build on every PR |

### 3.3 Observability (Priority: High)
| Item | Action |
|------|--------|
| Structured logging | Winston/Pino with log levels, requestId, userId |
| Error tracking | Sentry (frontend + backend) for production errors |
| Health + readiness | `/health` (liveness), `/ready` (DB + critical deps) |
| Metrics | Optional: Prometheus/DataDog for request count, latency, errors |

### 3.4 DevOps (Priority: Medium)
| Item | Action |
|------|--------|
| .env.example | Backend + frontend ke saath documented env vars |
| Docker | Dockerfile (node + next build), docker-compose (app + mongo) |
| CI/CD | Build, test, deploy (e.g. Vercel frontend, Railway/Render backend) |
| DB backups | Document strategy (e.g. MongoDB Atlas backups / cron dump) |

### 3.5 UX & Frontend (Priority: Medium)
| Item | Action |
|------|--------|
| PWA | next-pwa ya manual: manifest, service worker, offline fallback |
| Sitemap/robots | Dynamic sitemap (/, /menu, /r/[slug]), robots.txt |
| Error boundaries | Global + per-section boundaries with retry/logout |
| Next/Image | Replace critical `<img>` with `next/image` (LCP, blur) |
| Skeletons | List/table pages par consistent loading skeletons |
| A11y | Focus order, ARIA labels, keyboard nav; axe-core in CI |

### 3.6 Product Features (Priority: Medium)
| Item | Action |
|------|--------|
| Email notifications | Order confirm, booking confirm, password reset via Nodemailer/SendGrid |
| Discounts/Coupons | Coupon model + apply at checkout (percentage/fixed) |
| Reports export | Orders/Revenue/Users → CSV/PDF (admin) |
| Audit log | Admin actions (who, when, what) in separate collection + UI (super/master) |
| Inventory (optional) | Menu item stock, low-stock alert, out-of-stock hide/disable |

### 3.7 API & Data (Priority: Medium)
| Item | Action |
|------|--------|
| API versioning | Prefix routes with `/api/v1/`, plan for v2 |
| OpenAPI/Swagger | Generate docs from routes; share with frontend/mobile |
| Pagination | List APIs: `limit`, `offset` or `cursor` + total count |
| Idempotency | POST order/booking/payment par `Idempotency-Key` header support |
| Caching | Redis for menu/restaurant by slug (short TTL) in high traffic |

### 3.8 Scale & Performance (Priority: Medium–Low)
| Item | Action |
|------|--------|
| CDN | Static assets + images via CDN (Vercel/Cloudflare) |
| DB indexes | Orders, bookings, users by restaurantId + date; review explain plans |
| Connection pool | Mongoose pool size production ke hisaab se |
| Rate limit tuning | Login/auth strict; read APIs relaxed per IP/user |

### 3.9 International & Compliance (Priority: As needed)
| Item | Action |
|------|--------|
| i18n | Full i18n (not just Hindi/English) — next-intl ya similar |
| GDPR/Privacy | Cookie consent, data export, delete account flow |
| Tax display | Per-region tax labels (e.g. GST) on menu/checkout |

---

## 4. RECOMMENDED ORDER (Phasing)

**Phase 1 (1–2 weeks)**  
- Env validation + .env.example  
- Helmet + CORS tighten  
- Basic backend + API integration tests  
- Structured logging + Sentry (backend)

**Phase 2 (2–3 weeks)**  
- Frontend tests + E2E (1–2 flows)  
- PWA (manifest + service worker)  
- Sitemap/robots  
- Email: order + booking confirmation

**Phase 3 (2–4 weeks)**  
- Discounts/Coupons  
- Reports export (CSV/PDF)  
- Audit log (backend + super/master UI)  
- OpenAPI doc + idempotency for payment/order

**Phase 4 (Ongoing)**  
- 2FA for admins  
- Inventory (if required)  
- Full i18n + compliance (GDPR/tax)  
- Performance: CDN, caching, DB tuning

---

## 5. SUMMARY TABLE

| Category       | Current | Missing / Improve |
|----------------|---------|-------------------|
| Testing        | ❌ None | Unit, integration, E2E, CI |
| Security       | ⚠️ Basic | Helmet, CORS, sanitize, env check, 2FA |
| Logging/Monitor| ❌ Console only | Structured logs, Sentry, health/ready |
| DevOps         | ⚠️ Manual | Docker, .env.example, CI/CD, backups |
| PWA/SEO        | ⚠️ SEO partial | PWA, sitemap, robots, Next/Image |
| Notifications  | ⚠️ WhatsApp optional | Email confirmations, templates |
| Product        | ✅ Solid base | Coupons, export, audit log, inventory |
| API            | ✅ Working | Versioning, docs, pagination, idempotency, cache |

Is file ko baseline maan kar phase-wise implement karenge to Restro OS world-class reliability, security, aur scalability ke kareeb aa jayegi.
