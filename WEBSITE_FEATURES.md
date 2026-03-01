# Restro OS — Website & App Functionality (Full Reference)

This document describes all user-facing pages, roles, and features of the Restro OS application.

---

## 1. Overview: Two “Sites”

| Site | Audience | Entry | Purpose |
|------|----------|--------|---------|
| **SaaS Landing** | Restaurant owners (buyers) | `/` (homepage) | Marketing: explain product, pricing, trials; convert to signup/demo |
| **Customer & Admin App** | Food customers + restaurant staff | `/menu`, `/booking`, `/admin/*`, `/r/[slug]` | Order food, book tables, manage restaurant |

- **Landing (`/`)**: Dark SaaS-style page with Hero, Problem, Features, Pricing, ROI, Demo, Testimonials, CTA. Nav: Features, Pricing, Contact, Login, Start Free Trial. No cart, no DB indicator, no WhatsApp.
- **Rest of app**: Customer nav (Home, Menu, About, Contact), Cart, DB status, WhatsApp. Restaurant admin at `/admin/*`, multi-tenant customer entry at `/r/[slug]`.

---

## 2. User Roles (Backend)

| Role | Scope | Use Case |
|------|--------|----------|
| `super_admin` | Platform | Manage all restaurants, plans, subscriptions; full platform control |
| `master_admin` | Platform / brand | Manage restaurants under a brand/group |
| `admin` | Single restaurant | Restaurant owner / main manager |
| `manager` | Single restaurant | Day-to-day management |
| `staff` | Single restaurant | Orders, service |
| `cashier` | Single restaurant | Billing, payments |
| `customer` | None (guest) | Order food, book tables, reviews |

- Super Admin: `/admin/super/login` → panel at `/admin/super/*`
- Master Admin: `/admin/master/login` → panel at `/admin/master/*`
- Restaurant Admin/Staff: `/admin/login` → panel at `/admin/*`
- Customer: `/login`, `/signup` (no role in DB per-se; JWT for orders/bookings)

---

## 3. Frontend Routes (Pages) — Full List

### 3.1 Public (no login)

| Route | Purpose |
|-------|---------|
| `/` | **SaaS landing** — Hero, Problem, Features, Pricing, ROI, Demo, Testimonials, Final CTA. For restaurant owners. |
| `/menu` | Menu listing (optional `?restaurant=slug`). Categories, veg/non-veg, add to cart. |
| `/booking` | Table booking form (optional `?restaurant=slug`). Date, time, guests, advance payment (Razorpay). |
| `/about` | About the restaurant (customer-facing). |
| `/contact` | Contact page; used as “Book Demo” target from landing. |
| `/r/[slug]` | **Restaurant-by-slug** — Public page for one restaurant. Shows "Subscription Expired" if suspended. |
| `/restaurant/signup` | **Restaurant onboarding** — Name, slug, plan, admin email, password. "Start Free Trial" links here. |
| `/login` | **Customer login** — Email + password → JWT; used for orders/bookings. |
| `/signup` | **Customer signup** — Register (name, email, phone, password) → then login. “Start Free Trial” from landing. |

### 3.2 Customer (after login: cart, checkout, orders)

| Route | Purpose |
|-------|---------|
| `/cart` | Cart summary; proceed to checkout. |
| `/checkout` | Checkout: payment (Razorpay/COD), place order. |

### 3.3 Restaurant Admin Panel (after `/admin/login`)

| Route | Purpose |
|-------|---------|
| `/admin/login` | Restaurant admin/staff login (email + password). |
| `/admin/dashboard` | Dashboard: KPIs, quick stats. |
| `/admin/orders` | Order list; update status (pending → confirmed → preparing → ready → completed). |
| `/admin/menu` | Menu CRUD (categories, items, prices, veg/non-veg, images). |
| `/admin/bookings` | Booking list; confirm/cancel, assign table. |
| `/admin/billing` | Bills: from orders + offline (walk-in) billing. |
| `/admin/analytics` | Analytics: orders per hour, top selling, revenue, repeat customers, bookings. |
| `/admin/revenue` | Revenue stats and customer stats. |
| `/admin/reviews` | Customer reviews; respond/delete. |
| `/admin/users` | Staff/users for this restaurant (CRUD). |
| `/admin/customers` | Customer list (orders/bookings). |
| `/admin/hero-images` | Hero carousel images for customer site. |
| `/admin/payments` | Payment-related view. |
| `/admin/settings` | Restaurant settings. |
| `/admin-preview` | Preview of customer-facing site (optional). |

### 3.4 Super Admin Panel (after `/admin/super/login`)

| Route | Purpose |
|-------|---------|
| `/admin/super/login` | Super admin login. |
| `/admin/super/restaurants` | All restaurants; create, edit, status, features, reset password. |
| `/admin/super/restaurants/[id]` | Single restaurant detail. |
| `/admin/super/analytics` | Platform-level analytics. |
| `/admin/super/plans` | Rental plans CRUD (Basic, Pro, Premium, etc.). |
| `/admin/super/subscriptions` | All subscriptions; create, cancel. |
| `/admin/super/users` | Platform users (e.g. super admin users). |

### 3.5 Master Admin Panel (after `/admin/master/login`)

| Route | Purpose |
|-------|---------|
| `/admin/master/login` | Master admin login. |
| `/admin/master/restaurants` | Restaurants under this master. |
| `/admin/master/restaurants/[id]` | Single restaurant. |
| `/admin/master/analytics` | Analytics for master’s restaurants. |
| `/admin/master/plans` | Plans (view/manage as per backend). |
| `/admin/master/subscriptions` | Subscriptions. |
| `/admin/master/users` | Users under master scope. |

---

## 4. Backend API (Summary)

Base path: `/api` (e.g. `NEXT_PUBLIC_API_URL=http://localhost:5000/api`).

### 4.1 Health & readiness

- `GET /api/health` — Liveness; returns `{ status, message, timestamp, database: { connected } }`. Used by frontend “DB Online/Offline”.
- `GET /api/ready` — Readiness (DB); returns 503 if DB disconnected.

### 4.2 Auth (`/api/auth`)

- `POST /auth/register` — Customer signup (name, email, phone, password).
- `POST /auth/login` — Customer login (email, password, optional restaurantId).
- `POST /auth/admin/login` — Restaurant admin/staff login.
- `POST /auth/super-admin/login` — Super admin login.
- `POST /auth/master-admin/login` — Master admin login.
- `POST /auth/admin/create` — Create admin user (auth + requireAdminOrSuperAdmin).
- `PUT /auth/me/password` — Change own password (authenticated).

### 4.3 Restaurants (`/api/restaurants`)

- `GET /by-slug/:slug` — Get restaurant by slug (public).
- `GET /plans` — Get rental plans (public).
- `GET /me`, `PUT /me` — Current restaurant (auth).
- `GET /me/subscriptions` — Current restaurant’s subscriptions.

### 4.4 Menu (`/api/menu`)

- `GET /` — List menu items (query: restaurant slug/id as per tenant).
- `GET /categories`, `GET /price-range`, `GET /:id` — Public.
- `POST /`, `PUT /:id`, `DELETE /:id` — CRUD (auth + admin).

### 4.5 Orders (`/api/orders`)

- `POST /` — Create order (customer; can include payment verification).
- `GET /`, `GET /:id` — List/order detail (auth + admin).
- `PUT /:id/status`, `PUT /:id/payment` — Update status/payment (auth + admin).

### 4.6 Bookings (`/api/bookings`)

- `POST /` — Create booking (customer).
- `POST /payment/create`, `POST /payment/verify` — Advance payment (Razorpay).
- `GET /`, `GET /:id` — List/booking detail (auth + admin).
- `PUT /:id/status`, `PUT /:id/cancel` — Update/cancel (auth + admin).

### 4.7 Payments (`/api/payments`)

- `POST /create-order` — Create Razorpay order (e.g. for order payment).
- `POST /verify` — Verify Razorpay payment.

### 4.8 Billing (`/api/billing`)

- `POST /from-order` — Generate bill from order (auth + admin).
- `POST /offline` — Create offline (walk-in) bill (auth + admin).
- `GET /`, `GET /:id` — List/bill detail.
- `PUT /:id/status` — Update bill status.

### 4.9 Tables (`/api/tables`)

- `GET /`, `GET /:id` — List/table (with optional restaurant context).
- `POST /check-availability` — Check slots for booking.
- `POST /initialize` — Initialize tables (auth + admin).
- `PUT /:id/status` — Update table status (auth + admin).

### 4.10 Analytics (`/api/analytics`)

- All require auth + admin (or super/master as per backend).
- `GET /dashboard` — Dashboard stats.
- `GET /orders-per-hour`, `GET /top-selling`, `GET /revenue`, `GET /repeat-customers`, `GET /bookings` — Various reports.

### 4.11 Revenue (`/api/revenue`)

- `GET /stats`, `GET /customers` — Revenue and customer stats (auth + admin).

### 4.12 Reviews (`/api/reviews`)

- `GET /`, `GET /:id` — Public/customer.
- `POST /` — Create review (customer).
- `PUT /:id`, `DELETE /:id` — Update/delete (auth + admin).

### 4.13 Users (`/api/users`)

- All require auth + admin: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` — Staff CRUD.

### 4.14 Upload (`/api/upload`)

- `POST` — Image upload (e.g. menu, hero images) (auth + admin).

### 4.15 Hero images (`/api/hero-images`)

- `GET /` — Public hero images.
- `GET /admin`, `POST /admin`, `PUT /admin/order`, `DELETE /admin/:id` — Admin CRUD and order.

### 4.16 Super Admin (`/api/super-admin`)

- All require super admin auth.
- Restaurants: `GET/POST /restaurants`, `GET/PUT/PATCH /restaurants/:id`, `PATCH /restaurants/:id/status`, `PATCH /restaurants/:id/features`, `POST /restaurants/:id/reset-password`.
- Analytics: `GET /analytics`.
- Plans: `GET/POST /plans`, `PUT/DELETE /plans/:id`.
- Subscriptions: `GET /subscriptions`, `POST /subscriptions`, `PATCH /subscriptions/:id/cancel`, `GET /subscriptions/stats`.

---

## 5. Main User Flows

### 5.1 Restaurant owner (from landing)

1. Opens `/` → reads Hero, Features, Pricing.
2. Clicks **Start Free Trial** → `/restaurant/signup` (restaurant onboarding) or **Book Demo** → `/contact`.
3. Clicks **Login** → `/admin/login` → restaurant admin panel (`/admin/dashboard`, etc.).

*(Note: “Start Free Trial” currently goes to customer signup; a dedicated restaurant onboarding flow can be added later.)*

### 5.2 Customer (order + booking)

1. Discovers restaurant via `/` (customer nav) or `/r/[slug]`.
2. **Menu**: `/menu` → add to cart → `/cart` → `/checkout` → Razorpay/COD → order created.
3. **Booking**: `/booking` → select date/time/guests → optional advance payment → booking created.
4. Optional: `/login` or `/signup` for saved session.

### 5.3 Restaurant staff (admin panel)

1. `/admin/login` → JWT stored.
2. **Orders**: `/admin/orders` — update status, payment.
3. **Menu**: `/admin/menu` — add/edit/delete items.
4. **Bookings**: `/admin/bookings` — confirm, cancel, assign table.
5. **Billing**: `/admin/billing` — create bill from order or offline (walk-in).
6. **Analytics**: `/admin/analytics`, `/admin/revenue` — reports.
7. **Users**: `/admin/users` — staff CRUD.
8. **Hero**: `/admin/hero-images` — carousel for customer site.

### 5.4 Super admin (platform)

1. `/admin/super/login` → super admin panel.
2. Manage restaurants, plans, subscriptions; platform analytics; reset restaurant admin passwords; feature flags per restaurant.

---

## 6. Multi-Tenancy & Context

- **Restaurant context**: Many API calls are scoped by `restaurantId` (from JWT or query). Customer menu/booking can pass `?restaurant=slug` or use default.
- **Customer site per restaurant**: `/r/[slug]` loads restaurant by slug and links to `/menu?restaurant=slug` and `/booking?restaurant=slug`.
- **Admin panel**: After `/admin/login`, user’s `restaurantId` in JWT scopes all admin APIs to that restaurant.

---

## 7. Integrations & Features (Summary)

- **Razorpay**: Order payment and booking advance payment (create order + verify).
- **WhatsApp**: Shown on all non-landing pages (wrapper hides on `/`); used for contact/reservations.
- **Language**: Hindi/English switch (customer-facing); font and copy change.
- **SEO**: Metadata and Schema.org (e.g. restaurant) in layout/utils.
- **Cart**: Persisted in localStorage; survives refresh.
- **Auth**: JWT in localStorage; sent as `Authorization: Bearer <token>`; 401/403 clear token and redirect admin to `/admin/login`.
- **PWA / Offline**: Web app manifest (`/manifest.json`), service worker (`/sw.js`) caches pages and shows `/offline.html` when offline; offline banner via `PWAProvider`; installable on mobile/desktop.

---

## 8. File / Folder Reference (High Level)

- **Landing**: `frontend/src/app/page.tsx` + `frontend/src/components/landing/*` (Hero, Problem, Features, Pricing, ROI, Demo, Testimonials, CTA).
- **Nav/Footer**: `Navbar.tsx` and `Footer.tsx` switch content by `pathname === '/'` (landing vs app).
- **WhatsApp**: Rendered only when not on `/` via `WhatsAppButtonWrapper.tsx`.
- **Admin layouts**: `admin/layout.tsx` (rental panel); super/master panels use their own routes and layouts.
- **API base**: `frontend/src/services/api.ts` (axios, base URL from `NEXT_PUBLIC_API_URL`).
- **PWA**: `frontend/public/manifest.json`, `frontend/public/sw.js`, `frontend/public/offline.html`, `frontend/public/icons/`, `frontend/src/components/PWAProvider.tsx`.

---

## 9. SaaS Maturity (Level 1–3)

- **Restaurant onboarding** (`/restaurant/signup`): Name, slug, plan, admin email, password. Backend creates restaurant, admin, Subscription (trial). Plan required; features from plan (Basic/Pro/Premium).
- **Subscription expiry**: Hourly job; customer site shows "Subscription Expired"; Super Admin has Renew subscription button.
- **Feature flags per plan**: Basic = Menu+Orders, Pro = +Booking+Billing, Premium = +Analytics+Staff. Middleware `requireFeature` on booking/billing/analytics/users.
- **UAE mode**: `region`, `currency` (AED), `taxRate` (5%), `parentRestaurantId`. See `docs/UAE_MODE.md`.
- **Audit log**: Menu edit/delete, order status/cancel; Super Admin `GET /api/super-admin/audit-logs`.
- **Soft delete**: Menu uses `isDeleted: true`.
- **Role permission matrix**: Manager (orders+booking), staff (orders read+update status), cashier (billing). `requirePermission` on routes; `backend/src/config/permissions.ts`.
- **Metrics**: Super Admin analytics include Total MRR, Active restaurants, Expired subscriptions, daily trend.
- **Backup/restore**: `docs/DISASTER_RECOVERY.md`, `backend/scripts/backup-db.sh`, `restore-db.sh`.
- **API versioning**: Routes also at `/api/v1/*`.

This file is the single reference for “website ka full function info” — routes, roles, API, and main flows.
