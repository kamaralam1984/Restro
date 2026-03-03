### 1. Project Title

**Restro OS – Multi-Tenant Restaurant Management SaaS**

---

### 2. Executive Summary

Restro OS is a production-ready, multi-tenant restaurant management SaaS built with Next.js 14 (App Router), Node.js/Express, and MongoDB (Mongoose).  
Each restaurant operates in an isolated tenant, identified by `restaurantId` / `slug`, and secured by role-based access control (Admin, Manager, Staff, Cashier).  
The platform manages end-to-end subscription lifecycles (trial → active → past-due → suspended), enforces per-tenant rate limiting, and centralizes logging for debugging and audit.  
Slot-based table booking logic prevents conflicting reservations, and table-level pricing rules safely determine when booking-based discounts are applied.  
The system is designed around clean boundaries, observability, and safe recovery through transaction-based backup and restore flows.

---

### 3. Architecture Overview

**High-level flow**

`Client (Next.js 14, App Router)`  
→ `Express API (Node.js + TypeScript)`  
→ `MongoDB (Mongoose models)`  
→ `Razorpay (order & subscription payments)`  
→ `Email / SMS / WhatsApp services`

**Multi-tenant characteristics**

- **restaurantId / slug-based data isolation**
  - All restaurant-specific entities (users, menu, orders, bookings, bills, analytics) include a `restaurantId` and/or URL `slug`.
  - API controllers always filter data by the current tenant, typically using `req.user.restaurantId` or route parameters.

- **Feature gating per subscription plan**
  - `RentalPlan` defines plan-level capabilities.
  - Each `Restaurant` stores a `features` object representing enabled modules (billing, bookings, analytics, staff control, etc.).
  - Super Admin can override per-restaurant features regardless of the base plan.

---

### 4. Engineering Highlights

- **Multi-tenant data isolation**
  - Tenant-aware models and controllers; no cross-tenant queries without explicit intent.
  - Business logic always resolves and uses the current tenant (`restaurantId`) before touching data.

- **Scoped JWT authentication**
  - JWT payload includes `userId`, `role`, and optional `restaurantId`.
  - Auth middleware attaches `req.user`, which powers authorization, rate limiting, logging, and multi-tenant access checks.

- **Role-based access control**
  - Platform roles: `super_admin`, `master_admin`.
  - Restaurant roles: `admin`, `manager`, `staff`, `cashier`, `customer`.
  - Per-restaurant `rolePermissions` define which staff roles can access which navigation sections and APIs.

- **Slot-based booking conflict prevention algorithm**
  - Bookings normalize and store start/end time and duration.
  - On create, the system queries existing bookings for the same restaurant + table to detect overlapping time windows.
  - Booking rules (at least 2 hours in advance, within operating hours) are enforced server-side.

- **Table-level pricing & discount qualification engine**
  - `Table` model optionally holds:
    - `hourlyRate` – per-table booking rate.
    - `discountThreshold` – minimum order total required for discount.
    - `discountAmount` – discount to apply (often equal to one hour of booking).
  - Shared `getBookingConfig(capacity, table?)` function (frontend + backend) computes effective pricing/discount config.
  - When an order is associated with a booking and meets the threshold, the engine applies a 1-hour discount safely.

- **Centralized structured logging**
  - Logger outputs structured, JSON-like entries in production (timestamp, level, message, metadata).
  - Global `errorHandler` middleware:
    - Logs error details (status code, stack, route).
    - Persists error into `ErrorLog` collection with status (`open`, `investigating`, `resolved`).
  - Super Admin UI exposes an “Error & Bug Control” dashboard backed by this data.

- **Per-tenant rate limiting with abuse detection**
  - Generic rate limiting on `/api` to protect from brute-force or flooding.
  - Tenant-aware limiter on `/api/orders` and `/api/bookings`, keyed by `restaurantId` where possible.
  - Prevents a single tenant from over-consuming shared capacity.

- **Subscription lifecycle enforcement**
  - `Subscription` documents model plan, billing cycle, amount, and status (`trial`, `active`, `expired`, `past_due`, `cancelled`).
  - Razorpay subscription webhooks adjust `Subscription` and `Restaurant.subscriptionStatus` on:
    - Successful charging,
    - Payment failure (with grace periods),
    - Cancellation.
  - Only restaurants with valid, active subscriptions can access gated features.

- **Cron-based automation (emails, expiry checks, backups)**
  - `node-cron` jobs handle:
    - Weekly full-platform backups (`BackupSnapshot` collection) with TTL index for auto-cleanup after 6 months.
    - Trial and subscription expiry checks, including transitions to `past_due` or `suspended`.

- **Backup & restore system with transaction safety**
  - Backup export aggregates:
    - `Restaurant`, `User`, `Menu`, `Order`, `Bill`, `Booking`, `Table`, `HeroImage`, `Subscription`, `RentalPlan`, `AuditLog`.
  - Restore process:
    - Runs in a MongoDB transaction.
    - Uses `bulkWrite` + `upsert` per collection to recreate state.
    - Supports a “dry run” mode to validate snapshots without persisting changes.

---

### 5. Tech Stack

#### Frontend

- Next.js 14 (App Router) with TypeScript  
- React Context for:
  - Cart (per restaurant slug)
  - User/auth state
  - Restaurant branding
  - Language (Hindi/English)
  - Theme (dark / light / color-blind)
- Tailwind CSS and Framer Motion  
- Axios HTTP client with centralized interceptors

#### Backend

- Node.js + Express + TypeScript  
- MongoDB with Mongoose  
- Razorpay SDK (order payments + subscription webhooks)  
- Nodemailer + SMS/WhatsApp adapters  
- `helmet`, `cors`, `express-mongo-sanitize` for HTTP and data protection  
- Custom rate limiter (IP + tenant aware)  
- `node-cron` for scheduled tasks

---

### 6. Security & Production Considerations

- **Input validation**
  - Controllers validate required fields, formats (email, slug, phone), booking rules, and password length.
  - Mongoose schemas enforce type and enum constraints for model integrity.

- **Rate limiting**
  - Global limiter on `/api`.
  - Stricter rate limits on login/auth and write-intensive endpoints (orders, bookings).
  - Tenant-aware limiter ensures one restaurant cannot flood shared resources.

- **Environment-based secrets**
  - JWT secrets, Razorpay keys, SMTP and SMS/WhatsApp credentials are loaded from environment variables.
  - Only `NEXT_PUBLIC_*` variables are exposed to the frontend bundle.

- **Structured logging**
  - Logging includes timestamp, level, message, and contextual metadata (route, tenant, user, status).
  - Production logs are JSON-compatible for integration with log aggregation systems (ELK, Loki, etc.).

- **Error tracking**
  - All unhandled errors are written to `ErrorLog`.
  - Super Admin tooling allows filtering by status and restaurant, and updating investigation status.

- **Multi-tenant access enforcement**
  - Auth middleware limits platform routes to `super_admin` / `master_admin`.
  - Restaurant-scoped routes require `req.user.restaurantId` to match target tenant.
  - Feature flags and `rolePermissions` are checked at middleware/controller level to avoid accidental cross-tenant access.

---

### 7. Installation (Short)

#### Backend Setup

```bash
cd backend
npm install

cp .env.example .env
# Configure:
# - MONGODB_URI
# - JWT_SECRET
# - RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
# - SMTP / SMS / WhatsApp credentials

npm run dev              # development
# or
npm run build && npm start   # production
```

#### Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env.local
# Configure:
# - NEXT_PUBLIC_API_URL (e.g. https://api.your-domain.com/api)
# - NEXT_PUBLIC_RAZORPAY_KEY_ID
# - NEXT_PUBLIC_SITE_URL

npm run dev    # development
npm run build  # production build
```

---

### 8. Deployment Overview

- **Frontend (Next.js)**
  - Typical target: Vercel or any Node-compatible host.
  - `NEXT_PUBLIC_API_URL` set to the public backend API base URL.

- **Backend (Express API)**
  - Typical target: VPS (DigitalOcean, Hetzner) or Render.
  - Run behind a reverse proxy (Nginx/Traefik) with HTTPS termination.
  - Environment-specific configuration via `.env` or secret manager.

- **Database (MongoDB Atlas)**
  - Managed MongoDB cluster.
  - Access restricted to backend via IP allowlist or VPC peering.

- **HTTPS requirements**
  - All traffic (frontend ↔ backend ↔ Razorpay) is expected to be HTTPS.
  - Razorpay webhooks must be HTTPS and validated using `RAZORPAY_WEBHOOK_SECRET`.

---

### 9. Documentation

For deeper architecture and flow diagrams, see:

- `docs/SYSTEM_OVERVIEW.md`  
  *(or the equivalent system overview document in this repository, such as `info.md`)*  

This documentation covers multi-tenant design, booking and billing internals, subscription lifecycle, backup/restore mechanisms, and operational practices in more detail.

