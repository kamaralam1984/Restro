# Restro OS — Website & App Functionality (Full Reference)

This document describes all user-facing pages, roles, and features of the Restro OS application.

---

## 1. Overview: Two "Sites"

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

**Role isolation (security guards):**
- `frontend/src/app/admin/super/layout.tsx` — blocks anyone without `super_admin` or `master_admin` role; redirects to `/admin/dashboard`
- `frontend/src/app/admin/master/layout.tsx` — blocks anyone without `master_admin` role; redirects to `/admin/dashboard`
- Restaurant admins cannot access super/master panels at all

---

## 3. Frontend Routes (Pages) — Full List

### 3.1 Public (no login)

| Route | Purpose |
|-------|---------|
| `/` | **SaaS landing** — Hero, Problem, Features, Pricing, ROI, Demo, Testimonials, Final CTA. For restaurant owners. |
| `/pricing` | **Pricing page** — 4 plan cards (Demo/Basic/Pro/Premium), Monthly/Yearly toggle, feature comparison table, FAQ. CTAs go to `/restaurant/signup?plan=ID&billing=monthly\|yearly`. |
| `/menu` | Menu listing (optional `?restaurant=slug`). Categories, veg/non-veg, add to cart. |
| `/booking` | Table booking form (optional `?restaurant=slug`). Date, time, guests, advance payment (Razorpay). |
| `/about` | About the restaurant (customer-facing). |
| `/contact` | Contact page; used as "Book Demo" target from landing. |
| `/r/[slug]` | **Restaurant-by-slug** — Premium black/gold homepage per restaurant. Featured menu items as carousel (auto-advance, dots, arrows). Fallback hero if no menu. Shows "Subscription Expired" if suspended. |
| `/restaurant/signup` | **Restaurant onboarding** — Name, slug, plan, admin email, password. Accepts `?plan=ID` and `?billing=monthly\|yearly` query params to pre-select plan from pricing page. |
| `/login` | **Customer login** — Email + password → JWT; used for orders/bookings. |
| `/signup` | **Customer signup** — Register (name, email, phone, password) → then login. |
| `/qr/[slug]/[table]` | **QR Scan & Order** — Mobile-optimized page shown when customer scans table QR code. Shows restaurant name + table number, featured menu items (6 items), Add to Cart, floating cart bar. No login required. Cart stored in `restro_os_cart[slug]`. |
| `/profile` | **Customer Portal** — 4 tabs: My Orders (with Reorder), My Bookings, Wallet & Rewards (points/tier), Account Settings (password change, saved addresses). Redirects to `/login` if not authenticated. |

### 3.2 Smart Redirect

| Route | Purpose |
|-------|---------|
| `/dashboard` | **Role-based redirect** — reads `localStorage.admin.role`; redirects `super_admin`/`master_admin` → `/admin/super/restaurants`, all others → `/admin/dashboard`. Shows spinner while checking. |

### 3.3 Customer (after login: cart, checkout, orders)

| Route | Purpose |
|-------|---------|
| `/cart` | Cart summary; proceed to checkout. |
| `/checkout` | Checkout: payment (Razorpay online / COD), place order. Online payment disabled if `NEXT_PUBLIC_RAZORPAY_KEY_ID` not set. |

### 3.4 Restaurant Admin Panel (after `/admin/login`)

Each restaurant admin sees only their own restaurant's data — all APIs scoped by `restaurantId` from JWT.

| Route | Purpose |
|-------|---------|
| `/admin/login` | Restaurant admin/staff login (email + password). |
| `/admin/dashboard` | Dashboard: KPIs (Today's Orders, Revenue, Pending Orders, Bookings, Tables), Recent Orders, quick-action tabs. |
| `/admin/orders` | Order list; update status (pending → confirmed → preparing → ready → completed). |
| `/admin/menu` | Menu CRUD (categories, items, prices, veg/non-veg, images). |
| `/admin/bookings` | Booking list; confirm/cancel, assign table. "Create 20 tables" prompt if tables not set up. |
| `/admin/tables` | Table management. |
| `/admin/table-rates` | Table rates and special offers for dine-in. |
| `/admin/offers` | **Offers & Discounts** — Create, toggle active/inactive, delete offers; localStorage-based (API integration pending). |
| `/admin/hero-images` | Hero carousel images for customer site. |
| `/admin/billing` | **Billing Management** — 5 tabs: Tax & Charges (GST%), Delivery settings, Payment Methods, Invoice/Receipt branding, Subscription info. Reads/saves via `GET /PUT /api/restaurants/me`. |
| `/admin/payments` | Payment-related view. |
| `/admin/revenue` | Revenue stats and customer stats. |
| `/admin/reports` | **Billing Reports (GST / Audit)** — Period filter (Today/Week/Month/Year/Custom), summary cards (Subtotal, GST, Discount, Grand Total), bill list, Download PDF. |
| `/admin/analytics` | **Advanced Analytics** — 6 KPI cards, Revenue Trend AreaChart (30 days), Peak Hours BarChart (24h), Menu Performance top-10 (by orders/revenue toggle), Customer Split PieChart, AI Business Insights (4 smart cards), Download Report. Uses recharts. |
| `/admin/kds` | **Kitchen Display System** — Live order queue in 3 columns (Queue/Preparing/Ready), auto-refresh every 5s, preparation timers (green<10min/yellow<20min/red>20min), "START COOKING" / "MARK READY" / "COMPLETE" action buttons, sound alert (Web Audio API), fullscreen mode, stats bar. |
| `/admin/qr-menu` | **QR Code Manager** — Per-table QR code generation using `api.qrserver.com`, download/copy link per table, Print All button. Shows "Create Tables" prompt if none exist. |
| `/admin/coupons` | **Coupons & Promotions** — Create/edit/delete coupon codes (percentage/flat/free_delivery), usage limit, per-user limit, validity dates, active toggle. Stats: Total/Active/Used/Revenue Saved. Backend API at `/api/coupons`. |
| `/admin/loyalty` | **Loyalty Program** — Enable/disable toggle, points-per-₹ settings, redemption value, min redeem threshold, points expiry. Bronze/Silver/Gold tier system with multipliers. Rewards catalog. Settings saved to localStorage. |
| `/admin/inventory` | **Inventory Management** — 4 tabs: Stock & Ingredients (CRUD, stock levels, color-coded alerts), Vendors (supplier management), Purchase Orders (create PO → ordered → received, auto-updates stock), Low Stock Alerts (red cards for items below min threshold). API: `/api/inventory`. |
| `/admin/pos` | **POS Billing System** — Full-screen 2-panel fast billing interface. Left: menu grid (search, category tabs, touch-friendly item cards). Right: cart with table/customer info, coupon apply, tax calc, split bill, payment method select (Cash/Card/Online). Receipt overlay with print option after order placed. Order types: Dine-in/Takeaway/Delivery. |
| `/admin/employees` | **Employee Management** — 4 tabs: Employees (CRUD with role badges — Manager/Chef/Waiter/Cashier/Delivery), Attendance (daily mark present/absent/late, summary strip), Shifts (weekly calendar view, add/edit shifts), Payroll (monthly calculation by days present, salary type). API: `/api/employees`. |
| `/admin/crm` | **CRM System** — 3 tabs: Leads Pipeline (Kanban — New/Contacted/Qualified/Converted columns), Customer Segments (All/New/Returning/VIP/Inactive with counts and avg spend), Follow-ups (overdue/today leads with Call/WhatsApp action buttons). API: `/api/crm/leads`. |
| `/admin/marketing` | **Marketing Automation** — 3 tabs: Campaigns (list with type/status/segment badges), Create Campaign (step-by-step: name → type WhatsApp/SMS/Email/Push → segment → message composer with {name} variables → schedule), Analytics (campaign stats, performance table). API: `/api/crm/campaigns`. |
| `/admin/wallet` | **Wallet & Referral Management** — 3 tabs: Customer Wallets (list with balance, add credits modal), Transactions (credit/debit history with source badges), Referral Program (enable/disable, reward settings, top referrers table, referral codes list). API: `/api/wallet`. |
| `/admin/abandoned-cart` | **Abandoned Cart Recovery** — 3 tabs: Abandoned Carts (list with send-reminder + mark-recovered actions, WhatsApp message preview modal), Recovery Campaigns (3 message templates with {name}/{items}/{total} variables, auto-send delay settings), Stats (KPIs + 7-day SVG bar chart). API: `/api/abandoned-cart`. |
| `/admin/affiliates` | **Affiliate System** — 3 tabs: Affiliates (CRUD with unique referral code, copy link, commission rate cards), Conversions (approve/mark-paid per order), Payouts (pending payout summary, mark paid per affiliate). Referral link: `/r/{slug}?aff={code}`. API: `/api/affiliates`. |
| `/admin/branches` | **Multi-Branch Management** — 3 tabs: All Branches (summary strip, branch cards with status/revenue/orders), Branch Analytics (branch selector + side-by-side comparison table, color-coded top/bottom), Add Branch (full form). API: `/api/branches`. |
| `/admin/franchise` | **Franchise Management** — 3 tabs: Franchisees (status pipeline — prospect/onboarding/active/terminated, royalty % and contract dates), Royalty Tracking (monthly royalty table, "Generate Royalties" button, overdue highlighted), Expansion Pipeline (Kanban columns). API: `/api/franchise`. |
| `/admin/white-label` | **White Label SaaS** — 3 tabs: Branding (live preview panel, brand name/colors/logo/custom CSS, "Hide Restro OS Branding" toggle), Domain & Email (custom domain + DNS setup instructions + SMTP config), Reseller Clients (add/manage clients, generate white-labeled login URLs). API: `/api/white-label`. |
| `/admin/ai-insights` | **AI Business Intelligence** — 3 tabs: Revenue Forecast (30-day actual + 7-day forecast SVG chart, MoM growth badge, best day/peak hour predictions), Business Insights (6 computed insight cards: demand spike, slow day, top category, return rate, AOV trend, revenue lost), Smart Recommendations (5 priority-scored action cards linking to relevant pages). Uses existing analytics APIs — no separate backend needed. |
| `/admin/website-builder` | **Website Builder** — 3-panel editor: Left (page selector + section palette + current sections list with Up/Down/Delete), Middle (live preview with click-to-select section cards), Right (properties editor: headline, colors, text, image URLs per section type). Saves to localStorage `restro_website_config`. Publish button → toast. |
| `/admin/themes` | **Theme Marketplace** — 3 tabs: Marketplace (9 theme cards with color swatch previews — Gold Royale/Ocean Blue/Forest Green/Crimson Bistro/Midnight Purple/Warm Amber/Rose Pink/Steel Gray/Sunset Orange; preview modal; paid themes locked at ₹499), My Themes (active theme + purchased), Custom Theme (color pickers + typography + border radius + live preview card; save to localStorage). |
| `/admin/customers` | Customer list with order count, total spent, last order date. |
| `/admin/reviews` | Customer reviews; respond/delete. |
| `/admin/users` | Staff/users for this restaurant (CRUD). |
| `/admin/staff-roles` | **Staff & Role Management** — Staff Members tab (filter by Manager/Cashier/Staff) + Role Permissions tab. |
| `/admin/settings` | Restaurant settings — 5 tabs: General (name, phone, currency, tax, address), Website/Front page, Payment, Notifications, Staff role access, Security. |
| `/admin-preview` | Preview of customer-facing site (optional). |

### 3.5 Super Admin Panel (after `/admin/super/login`)

| Route | Purpose |
|-------|---------|
| `/admin/super/login` | Super admin login. |
| `/admin/super/restaurants` | All restaurants; create, edit, status, features, reset password. |
| `/admin/super/restaurants/[id]` | Single restaurant detail. |
| `/admin/super/analytics` | Platform-level analytics. |
| `/admin/super/plans` | Rental plans CRUD (Basic, Pro, Premium, etc.). |
| `/admin/super/subscriptions` | All subscriptions; create, cancel. |
| `/admin/super/users` | Platform users (e.g. super admin users). |

### 3.6 Master Admin Panel (after `/admin/master/login`)

| Route | Purpose |
|-------|---------|
| `/admin/master/login` | Master admin login. |
| `/admin/master/restaurants` | Restaurants under this master. |
| `/admin/master/restaurants/[id]` | Single restaurant. |
| `/admin/master/analytics` | Analytics for master's restaurants. |
| `/admin/master/plans` | Plans (view/manage as per backend). |
| `/admin/master/subscriptions` | Subscriptions. |
| `/admin/master/users` | Users under master scope. |

---

## 4. Backend API (Summary)

Base path: `/api` (e.g. `NEXT_PUBLIC_API_URL=http://localhost:5000/api`).

### 4.1 Health & readiness

- `GET /api/health` — Liveness; returns `{ status, message, timestamp, database: { connected } }`. Used by frontend "DB Online/Offline".
- `GET /api/ready` — Readiness (DB); returns 503 if DB disconnected.

### 4.2 Auth (`/api/auth`)

- `POST /auth/register` — Customer signup (name, email, phone, password).
- `POST /auth/login` — Customer login (email, password, optional restaurantId).
- `POST /auth/admin/login` — Restaurant admin/staff login. JWT includes `restaurantId` from user record.
- `POST /auth/super-admin/login` — Super admin login.
- `POST /auth/master-admin/login` — Master admin login.
- `POST /auth/admin/create` — Create admin user (auth + requireAdminOrSuperAdmin).
- `PUT /auth/me/password` — Change own password (authenticated).

### 4.3 Restaurants (`/api/restaurants`)

- `GET /by-slug/:slug` — Get restaurant by slug (public).
- `GET /plans` — Get rental plans (public).
- `GET /me`, `PUT /me` — Current restaurant (auth; requires `restaurantId` in JWT).
- `GET /me/subscriptions` — Current restaurant's subscriptions.

### 4.4 Menu (`/api/menu`)

- `GET /` — List menu items (query: restaurant slug/id as per tenant). Response: `{ items: [...], total, page }` — always check `data?.items` not just `Array.isArray(data)`.
- `GET /categories`, `GET /price-range`, `GET /:id` — Public.
- `POST /`, `PUT /:id`, `DELETE /:id` — CRUD (auth + admin).

### 4.5 Orders (`/api/orders`)

- `POST /` — Create order (customer; can include payment verification). Items must use `id` field (not `_id`), mapped to `menuItemId` in payload.
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

### 4.16 Visitors (`/api/visitors`)

- Tracks page visits on customer-facing site (slug, page, referrer, device).
- `GET /` — List visitor logs (auth + super admin).
- `POST /` — Record visit (public, called from frontend on page load).
- Used by Super Admin Visitors page (`/admin/super/visitors`).

### 4.16b Chat (`/api/chat`)

- Live chat / support messages between restaurant and customers.
- `GET /` — List chat sessions (auth + admin).
- `POST /` — Send message.
- Used internally; UI optional per restaurant.

### 4.16c Super Admin (`/api/super-admin`)

- All require super admin auth.
- Restaurants: `GET/POST /restaurants`, `GET/PUT/PATCH /restaurants/:id`, `PATCH /restaurants/:id/status`, `PATCH /restaurants/:id/features`, `POST /restaurants/:id/reset-password`.
- Analytics: `GET /analytics`.
- Plans: `GET/POST /plans`, `PUT/DELETE /plans/:id`.
- Subscriptions: `GET /subscriptions`, `POST /subscriptions`, `PATCH /subscriptions/:id/cancel`, `GET /subscriptions/stats`.

### 4.18 Inventory (`/api/inventory`)

- `GET /ingredients` — List ingredients (query: `?low=true` for low-stock only). Auth + admin.
- `POST /ingredients` — Create ingredient (name, unit, category, currentStock, minStock, maxStock, costPerUnit, expiryDate).
- `PUT /ingredients/:id` — Update ingredient.
- `DELETE /ingredients/:id` — Soft delete (isActive: false).
- `POST /ingredients/:id/adjust` — Adjust stock: `{ quantity, type: 'add'|'remove', reason }`.
- `GET /vendors` — List vendors. Auth + admin.
- `POST /vendors` — Create vendor (name, phone, email, address, gstin, paymentTerms).
- `PUT /vendors/:id` — Update vendor.
- `DELETE /vendors/:id` — Soft delete.
- `GET /purchase-orders` — List POs. Auth + admin.
- `POST /purchase-orders` — Create PO (vendorId, items array, notes).
- `PUT /purchase-orders/:id/status` — Update PO status. When `received`: auto-increments each ingredient's currentStock.

### 4.19 Employees (`/api/employees`)

- `GET /employees` — List employees (filter by role/isActive, pagination). Auth + admin.
- `POST /employees` — Create employee (name, phone, email, role, salary, salaryType, joiningDate).
- `PUT /employees/:id` — Update employee.
- `DELETE /employees/:id` — Soft delete.
- `GET /attendance` — List attendance (filter: `?date=`, `?employeeId=`, `?month=YYYY-MM`). Auth + admin.
- `POST /attendance` — Mark attendance (upsert by employeeId+date; status: present/absent/late/half-day).
- `PUT /attendance/:id` — Update (checkOut time, status).
- `GET /attendance/summary` — `{ present, absent, late }` counts for today.
- `GET /shifts` — List shifts (filter: `?date=`, `?employeeId=`). Auth + admin.
- `POST /shifts` — Create shift (employeeId, date, startTime, endTime, role).
- `PUT /shifts/:id` — Update shift status.
- `DELETE /shifts/:id` — Delete shift.
- `GET /payroll` — Calculate payroll for month (`?month=YYYY-MM`): days present, earned salary per employee.

### 4.20 CRM & Marketing (`/api/crm`)

- `GET /leads` — List leads (filter by status/source). Auth + admin.
- `POST /leads` — Create lead (name, email, phone, source, status, notes, followUpDate, tags).
- `PUT /leads/:id` — Update lead (status, notes, followUpDate).
- `DELETE /leads/:id` — Delete lead.
- `GET /campaigns` — List campaigns. Auth + admin.
- `POST /campaigns` — Create campaign (name, type, targetSegment, message, subject, scheduledAt).
- `PUT /campaigns/:id` — Update campaign.
- `POST /campaigns/:id/send` — "Send" campaign (sets status=sent, sentAt=now). UI-only; actual delivery via external service.
- `DELETE /campaigns/:id` — Delete campaign.
- `GET /crm/stats` — `{ totalLeads, newLeads, converted, totalCampaigns, totalRecipients }`.

### 4.21 Wallet & Referral (`/api/wallet`)

- `GET /wallet/me` — Get current user's wallet (auto-creates if not exists). Auth.
- `GET /wallet/me/transactions` — Paginated transaction list. Auth.
- `POST /wallet/topup` — Admin adds credits to a customer wallet: `{ userId, amount, description }`. Auth + admin.
- `POST /wallet/pay` — Pay from wallet for an order: `{ amount, orderId }`. Auth.
- `POST /wallet/referral/generate` — Generate referral code for current user. Auth.
- `GET /wallet/referral/me` — Get user's referral code + usage stats. Auth.
- `POST /wallet/referral/apply` — Apply referral code: `{ code }` — credits reward to referrer. Auth.

### 4.17 Coupons (`/api/coupons`)

- `GET /` — List coupons for restaurant (auth + admin).
- `POST /` — Create coupon (code, type, value, minOrderAmount, usageLimit, validFrom, validUntil).
- `PUT /:id` — Update coupon (auth + admin).
- `DELETE /:id` — Delete coupon (auth + admin).
- `POST /validate` — **Public** — Validate coupon code; body: `{ code, restaurantId, cartTotal }`. Returns `{ valid, discount, type, message }`. Checks: isActive, date range, usageLimit, minOrderAmount.

### 4.22 Abandoned Cart (`/api/abandoned-cart`)

- `GET /` — List abandoned carts (filter: `?status=`, `?date=`). Auth + admin.
- `POST /` — Create abandoned cart record (customerPhone, items, cartTotal, slug, source).
- `PUT /:id/status` — Update status (reminder_sent / recovered / ignored). Auth + admin.
- `POST /:id/remind` — Mark reminder sent + increment reminderCount. Auth + admin.
- `GET /stats` — `{ total, pending, recovered, recoveryRate% }`. Auth + admin.

### 4.23 Affiliates (`/api/affiliates`)

- `GET /affiliates` — List affiliates. Auth + admin.
- `POST /affiliates` — Create affiliate (name, email, phone, commissionType %, commissionValue, payoutMethod).
- `PUT /affiliates/:id` — Update affiliate.
- `DELETE /affiliates/:id` — Delete affiliate.
- `GET /affiliates/stats` — `{ totalAffiliates, totalEarned, totalOrders, pendingPayout }`. Auth + admin.
- `GET /affiliates/conversions` — List conversions (filter `?affiliateId=`). Auth + admin.
- `PUT /affiliates/conversions/:id/status` — Approve or mark paid. Auth + admin.

### 4.24 Multi-Branch (`/api/branches`)

- `GET /branches` — List branches. Auth + admin.
- `POST /branches` — Create branch (name, address, city, phone, manager info, opening/closing time, features).
- `PUT /branches/:id` — Update branch.
- `DELETE /branches/:id` — Soft delete (status: inactive).
- `GET /branches/:id/metrics` — Branch metrics for last 30 days.
- `GET /branches/summary` — `{ totalBranches, totalRevenue, totalOrders, topBranch }`.

### 4.25 Franchise (`/api/franchise`)

- `GET /franchisees` — List franchisees. Auth + admin.
- `POST /franchisees` — Create franchisee (ownerName, city, royaltyType %, contractDates).
- `PUT /franchisees/:id` — Update franchisee.
- `GET /royalties` — List royalty payments (filter by month/franchisee). Auth + admin.
- `POST /royalties` — Create royalty payment record.
- `PUT /royalties/:id/pay` — Mark royalty as paid.
- `GET /franchise/stats` — `{ totalFranchisees, active, totalRevenue, totalRoyaltyDue, totalRoyaltyPaid }`.

### 4.26 White Label (`/api/white-label`)

- `GET /white-label/me` — Get white label config for this restaurant (auto-creates with defaults if not exists). Auth + admin.
- `PUT /white-label/me` — Update config (agencyName, brandColor, logoUrl, customDomain, SMTP settings, hideRestroOSBranding). Auth + admin.
- `POST /white-label/clients` — Add reseller client (name, email, plan). Auth + admin.
- `DELETE /white-label/clients/:email` — Remove reseller client. Auth + admin.

---

## 5. Main User Flows

### 5.1 Restaurant owner (from landing)

1. Opens `/` → reads Hero, Features, Pricing.
2. Clicks **Plans & Pricing** (navbar) or **Start Free Trial** (CTA) → `/pricing`.
3. On `/pricing`: selects plan → clicks CTA → `/restaurant/signup?plan=ID&billing=monthly`.
4. On signup: plan pre-selected, "SELECTED PLAN" card shown with trial days and price. Demo shows "FREE — No credit card required".
5. After signup → `/admin/login` → restaurant admin panel.
6. Or goes to `/dashboard` which auto-redirects based on role.

### 5.2 Customer (order + booking)

1. Discovers restaurant via `/` (customer nav) or `/r/[slug]`.
2. **Menu**: `/menu` → add to cart → `/cart` → `/checkout` → Razorpay/COD → order created.
3. **Booking**: `/booking` → select date/time/guests → optional advance payment → booking created.
4. Optional: `/login` or `/signup` for saved session.

### 5.3 Restaurant staff (admin panel)

1. `/admin/login` → JWT stored in localStorage with `restaurantId` scoped to their restaurant.
2. **Orders**: `/admin/orders` — update status, payment.
3. **Kitchen**: `/admin/kds` — live kitchen display, mark orders cooking/ready.
4. **Menu**: `/admin/menu` — add/edit/delete items.
5. **Bookings**: `/admin/bookings` — confirm, cancel, assign table.
6. **QR Ordering**: `/admin/qr-menu` — generate QR codes per table for contactless ordering.
7. **Billing**: `/admin/billing` — GST settings, delivery charges, payment methods.
8. **Reports**: `/admin/reports` — GST/Audit reports, PDF download.
9. **Coupons**: `/admin/coupons` — create discount codes, set validity and limits.
10. **Loyalty**: `/admin/loyalty` — configure points system, tiers, rewards.
11. **Offers**: `/admin/offers` — create and manage discount offers.
12. **Staff Roles**: `/admin/staff-roles` — manage staff and their permissions.
13. **Analytics**: `/admin/analytics` — revenue trend, peak hours, menu performance, AI insights.
14. **Inventory**: `/admin/inventory` — manage ingredients, stock levels, vendors, purchase orders.
15. **POS Billing**: `/admin/pos` — fast billing screen for walk-in customers.
16. **Employees**: `/admin/employees` — attendance tracking, shifts, payroll.
17. **CRM**: `/admin/crm` — lead pipeline, customer segments, follow-ups.
18. **Marketing**: `/admin/marketing` — create and send WhatsApp/SMS/email campaigns.
19. **Wallet**: `/admin/wallet` — manage customer wallets, add credits, referral program.
20. **Abandoned Cart**: `/admin/abandoned-cart` — view abandoned carts, send WhatsApp reminders, track recovery.
21. **Affiliates**: `/admin/affiliates` — manage affiliate partners, track conversions and payouts.
22. **Multi-Branch**: `/admin/branches` — manage multiple restaurant locations, compare branch analytics.
23. **Franchise**: `/admin/franchise` — manage franchisees, track royalties, expansion pipeline.
24. **White Label**: `/admin/white-label` — custom branding, domain, reseller client management.
25. **AI Insights**: `/admin/ai-insights` — revenue forecast, computed business insights, smart recommendations.
26. **Website Builder**: `/admin/website-builder` — visual page editor with section palette and properties panel.
27. **Theme Market**: `/admin/themes` — browse 9 themes, apply or build custom theme.
28. **Users**: `/admin/users` — staff CRUD.
29. **Hero**: `/admin/hero-images` — carousel for customer site.
30. **Settings**: `/admin/settings` — restaurant config, front page, security.

### 5.5 Customer (QR table ordering)

1. Scans QR code at table → `/qr/[slug]/[tableNumber]`.
2. Sees restaurant name, table number, featured menu items.
3. Adds items to cart (no login needed).
4. Floating gold cart bar appears → taps → `/cart?restaurant=slug&table=N`.
5. Checkout → COD or online payment → order goes to kitchen KDS.

### 5.4 Super admin (platform)

1. `/admin/super/login` → super admin panel.
2. Manage restaurants, plans, subscriptions; platform analytics; reset restaurant admin passwords; feature flags per restaurant.
3. Restaurant admins are blocked from accessing `/admin/super/*` by layout guard.

---

## 6. Multi-Tenancy & Context

- **Restaurant context**: Many API calls are scoped by `restaurantId` (from JWT or query). Customer menu/booking can pass `?restaurant=slug` or use default.
- **Customer site per restaurant**: `/r/[slug]` loads restaurant by slug; premium black/gold design with featured menu items carousel; links to `/menu?restaurant=slug` and `/booking?restaurant=slug`.
- **Admin panel**: After `/admin/login`, user's `restaurantId` in JWT scopes all admin APIs to that restaurant. If `restaurantId` is missing from JWT, all restaurant-specific APIs return `400 No restaurant context`.
- **Duplicate user guard**: Each admin email should map to exactly one user record with a valid `restaurantId`. Duplicate records with `null` restaurantId cause login to pick the wrong record.

---

## 7. Integrations & Features (Summary)

- **Razorpay**: Order payment and booking advance payment (create order + verify). Requires `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `frontend/.env.local`. Online payment button disabled (greyed out) if key not set.
- **WhatsApp**: Shown on all non-landing pages (wrapper hides on `/`); used for contact/reservations.
- **Language**: Hindi/English switch (customer-facing); font and copy change.
- **SEO**: Metadata and Schema.org (e.g. restaurant) in layout/utils.
- **Cart**: Persisted in localStorage under key `restro_os_cart` as `{ [restaurantSlug]: [{id, name, price, quantity}] }`. Field is `id` (not `_id`).
- **Auth**: JWT in localStorage; sent as `Authorization: Bearer <token>`; 401/403 clear token and redirect admin to `/admin/login`. Token payload includes `userId`, `email`, `role`, `restaurantId`.
- **PWA / Offline**: Web app manifest (`/manifest.json`), service worker (`/sw.js`) caches pages and shows `/offline.html` when offline; offline banner via `PWAProvider`; installable on mobile/desktop.

---

## 8. File / Folder Reference (High Level)

- **Landing**: `frontend/src/app/page.tsx` + `frontend/src/components/landing/*` (Hero, Problem, Features, Pricing, ROI, Demo, Testimonials, CTA).
- **Pricing page**: `frontend/src/app/pricing/page.tsx` — standalone SaaS pricing for restaurant owners; fetches plans from `/api/restaurants/plans`; fallback hardcoded plans if API empty; normalizes API fields (`maxMenuItems` → `menuItems` etc.).
- **Nav/Footer**: `Navbar.tsx` and `Footer.tsx` switch content by `pathname === '/'` (landing vs app). Navbar has "Plans & Pricing" link → `/pricing` (desktop + mobile, visible when not logged in as admin).
- **WhatsApp**: Rendered only when not on `/` via `WhatsAppButtonWrapper.tsx`.
- **Restaurant homepage**: `frontend/src/app/r/[slug]/page.tsx` — premium black/gold design, menu carousel.
- **Dashboard redirect**: `frontend/src/app/dashboard/page.tsx` — client-side role-based redirect.
- **Admin layouts**:
  - `admin/layout.tsx` — restaurant admin panel wrapper
  - `admin/super/layout.tsx` — blocks non-super/master roles
  - `admin/master/layout.tsx` — blocks non-master roles
- **Admin sidebar**: `frontend/src/components/admin/Sidebar.tsx` — navigation links for restaurant admin panel.
- **Admin pages**: `admin/billing/page.tsx`, `admin/offers/page.tsx`, `admin/staff-roles/page.tsx`, `admin/reports/page.tsx`, `admin/kds/page.tsx`, `admin/qr-menu/page.tsx`, `admin/coupons/page.tsx`, `admin/loyalty/page.tsx`, `admin/analytics/page.tsx` (recharts), `admin/inventory/page.tsx`, `admin/pos/page.tsx`, `admin/employees/page.tsx`, `admin/crm/page.tsx`, `admin/marketing/page.tsx`, `admin/wallet/page.tsx`.
- **Customer pages**: `app/qr/[slug]/[table]/page.tsx` — QR scan ordering; `app/profile/page.tsx` — customer portal.
- **Backend models**: `User`, `Restaurant`, `Menu`, `Order`, `Bill`, `Booking`, `Table`, `Review`, `HeroImage`, `RentalPlan`, `Subscription`, `Visitor`, `AuditLog`, `ErrorLog`, `OtpStore`, `PendingRestaurantSignup`, `Coupon`, `Inventory` (Ingredient+Vendor+PurchaseOrder), `Employee` (Employee+Attendance+Shift), `CRM` (Lead+Campaign), `Wallet` (Wallet+WalletTransaction), `Referral` (ReferralCode+ReferralUse), `AbandonedCart`, `Affiliate` (Affiliate+AffiliateConversion), `Branch` (Branch+BranchMetric), `Franchise` (Franchisee+RoyaltyPayment), `WhiteLabel`. **Total: 27 model files.**
- **Backend routes**: `routes/coupon.routes.ts`, `routes/inventory.routes.ts`, `routes/employee.routes.ts`, `routes/crm.routes.ts`, `routes/wallet.routes.ts`, `routes/abandonedCart.routes.ts`, `routes/affiliate.routes.ts`, `routes/branch.routes.ts`, `routes/franchise.routes.ts`, `routes/whiteLabel.routes.ts`. All registered in `app.ts`.
- **Enterprise admin pages** (full list): `admin/inventory`, `admin/pos`, `admin/employees`, `admin/crm`, `admin/marketing`, `admin/wallet`, `admin/abandoned-cart`, `admin/affiliates`, `admin/branches`, `admin/franchise`, `admin/white-label`, `admin/ai-insights`, `admin/website-builder`, `admin/themes`.
- **API base**: `frontend/src/services/api.ts` (axios, base URL from `NEXT_PUBLIC_API_URL`).
- **PWA**: `frontend/public/manifest.json`, `frontend/public/sw.js`, `frontend/public/offline.html`, `frontend/public/icons/`, `frontend/src/components/PWAProvider.tsx`.
- **Env**: `frontend/.env.local` — `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_RESTAURANT_SLUG`, `NEXT_PUBLIC_API_URL`.

---

## 9. SaaS Maturity (Level 1–3)

- **Restaurant onboarding** (`/restaurant/signup`): Name, slug, plan, admin email, password. Accepts `?plan=ID&billing=monthly|yearly` from `/pricing` page to pre-select plan. Backend creates restaurant, admin, Subscription (trial). Plan required; features from plan.
- **Subscription expiry**: Hourly job; customer site shows "Subscription Expired"; Super Admin has Renew subscription button.
- **Feature flags per plan**: Basic = Menu+Orders, Pro = +Booking+Billing, Premium = +Analytics+Staff. Middleware `requireFeature` on booking/billing/analytics/users.
- **UAE mode**: `region`, `currency` (AED), `taxRate` (5%), `parentRestaurantId`. See `docs/UAE_MODE.md`.
- **Audit log**: Menu edit/delete, order status/cancel; Super Admin `GET /api/super-admin/audit-logs`.
- **Soft delete**: Menu uses `isDeleted: true`.
- **Role permission matrix**: Manager (orders+booking), staff (orders read+update status), cashier (billing). `requirePermission` on routes; `backend/src/config/permissions.ts`.
- **Metrics**: Super Admin analytics include Total MRR, Active restaurants, Expired subscriptions, daily trend.
- **Backup/restore**: `docs/DISASTER_RECOVERY.md`, `backend/scripts/backup-db.sh`, `restore-db.sh`.
- **API versioning**: Routes also at `/api/v1/*`.
- **MongoDB**: Standalone (not replica set) — no transactions. `Restaurant.create()` and `restaurantSignup` use direct `.save()` calls instead of sessions.

---

## 10. Rental Plans (DB — `restro-os` collection: `rentalplans`)

4 plans seeded as of Jun 2026:

| Plan | Price | Yearly | Trial | Popular | Key Features |
|------|-------|--------|-------|---------|-------------|
| **Demo** | ₹0 | ₹0 | 3 days | No | 20 menu items, 2 staff, 5 tables, Online orders, Table booking, Billing |
| **Basic** | ₹1,999/mo | ₹19,990/yr | 7 days | No | 50 items, 3 staff, 10 tables, Online orders, Billing |
| **Pro** | ₹3,999/mo | ₹39,990/yr | 7 days | **Yes** | 200 items, 10 staff, 30 tables, Analytics, Staff roles, WhatsApp |
| **Premium** | ₹6,999/mo | ₹69,990/yr | 14 days | No | Unlimited everything, Custom domain, Priority support |

- Plans served via `GET /api/restaurants/plans` (public endpoint)
- Created/managed via `POST/PUT/DELETE /api/super-admin/plans` (super admin only)
- `/pricing` page fetches live plans; falls back to hardcoded values if API returns empty
- API features use `maxMenuItems`/`maxStaff`/`maxTables`; pricing page normalizes these to its own field names

---

## 11. Known Issues & Fixes Log

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `Transaction numbers are only allowed on a replica set member` | Local MongoDB is standalone | Removed all `mongoose.startSession()` / `startTransaction()` from `restaurant.controller.ts` |
| `No restaurant context` on all admin pages | Duplicate user record with same email; `null` restaurantId record matched first at login | Delete duplicate user; ensure only one user record per admin email |
| Billing page infinite API spam | `showToast` in `useCallback([toastCounter])` caused re-render loop | Moved counter increment inside `setToastCounter` functional update; `useCallback(fn, [])` |
| `/admin/super/restaurants` redirecting away | New `super/layout.tsx` wrapped pages in `AdminLayout` causing conflict | Changed layout to return `<>{children}</>` without any wrapper |
| Menu items not showing on `/r/[slug]` | API returns `{items:[...]}` object; page checked `Array.isArray(data)` | Fixed: `Array.isArray(data) ? data : (data?.items ?? [])` |
| Razorpay "not configured" alert | `NEXT_PUBLIC_RAZORPAY_KEY_ID` missing from `frontend/.env.local` | Added key to `.env.local` |
| COD order `menuItemId is required` | Test cart used `_id` field; order payload maps `i.id → menuItemId` | Cart items must use `id` field |
| Pricing page showing "undefined Menu Items" | API plan features use `maxMenuItems` but component expected `menuItems` | Added field normalization in `useEffect` merge logic in `pricing/page.tsx` |
| QR customer page "Something went wrong" | (1) Wrong API endpoint `/restaurants/${slug}` instead of `/restaurants/by-slug/${slug}`; (2) `next/image` used without domain config; (3) `cart.reduce is not a function` — cart is `{[slug]:[...]}` object not array | Fixed endpoint; replaced `Image` with `<img>`; rewrote cart helpers to use slug-keyed structure (`getCartForSlug`, `saveCartForSlug`) |

---

## 12. Platform Scope — Complete Module Count (Jun 2026)

Restro OS is now a full-stack SaaS restaurant management platform. Comparable to Petpooja / Posist / Toast POS.

### Admin Panel Modules (30 pages)

| Category | Modules |
|----------|---------|
| **Core Operations** | Dashboard, Orders, Kitchen Display (KDS), POS Billing, Menu, Bookings, Tables |
| **Customer Engagement** | Coupons, Loyalty Program, Offers & Discounts, QR Menu, Abandoned Cart Recovery |
| **Marketing & CRM** | Marketing Automation, CRM (Leads), Wallet & Referral |
| **Inventory & Staff** | Inventory Management, Employee Management (Attendance/Shifts/Payroll) |
| **Finance & Reports** | Billing Panel, Payments, Revenue, Reports (GST/Audit), Analytics (recharts) |
| **Growth & Scale** | Affiliates, Multi-Branch Management, Franchise Management |
| **Platform & Branding** | White Label SaaS, AI Business Intelligence, Website Builder, Theme Marketplace |
| **Admin Utilities** | Customers, Reviews, Users, Staff Roles, Hero Images, Settings |

### Backend API Routes (26 endpoint groups)

`/api/auth`, `/api/restaurants`, `/api/menu`, `/api/orders`, `/api/bookings`, `/api/payments`, `/api/billing`, `/api/tables`, `/api/analytics`, `/api/revenue`, `/api/reviews`, `/api/users`, `/api/upload`, `/api/hero-images`, `/api/visitors`, `/api/chat`, `/api/contact`, `/api/super-admin`, `/api/coupons`, `/api/inventory`, `/api/employees`, `/api/crm`, `/api/wallet`, `/api/abandoned-cart`, `/api/affiliates`, `/api/branches`, `/api/franchise`, `/api/white-label` — **28 route groups total**

### Backend Models (16 files)

User, Restaurant, Menu, Order, Bill, Booking, Table, Review, RentalPlan, Subscription, Coupon, Inventory (Ingredient+Vendor+PurchaseOrder), Employee (Employee+Attendance+Shift), CRM (Lead+Campaign), Wallet (Wallet+WalletTransaction), Referral (ReferralCode+ReferralUse), AbandonedCart, Affiliate (Affiliate+AffiliateConversion), Branch (Branch+BranchMetric), Franchise (Franchisee+RoyaltyPayment), WhiteLabel

### Frontend Pages Count

| Panel | Pages |
|-------|-------|
| Public / Customer | 10 (`/`, `/pricing`, `/menu`, `/booking`, `/r/[slug]`, `/qr/[slug]/[table]`, `/login`, `/signup`, `/profile`, `/contact`) |
| Restaurant Admin | 30 (`/admin/*`) |
| Super Admin | 6 (`/admin/super/*`) |
| Master Admin | 5 (`/admin/master/*`) |
| **Total** | **51 pages** |

### Competitive Feature Parity

| Feature | Restro OS | Petpooja | Posist | Toast POS |
|---------|-----------|---------|--------|-----------|
| POS Billing | ✓ | ✓ | ✓ | ✓ |
| KDS | ✓ | ✓ | ✓ | ✓ |
| Online Ordering + QR | ✓ | ✓ | ✓ | ✓ |
| Inventory Management | ✓ | ✓ | ✓ | ✓ |
| Employee + Payroll | ✓ | ✓ | ✓ | ✓ |
| CRM + Marketing | ✓ | Partial | ✓ | Partial |
| Loyalty + Coupons | ✓ | ✓ | ✓ | ✓ |
| Wallet + Referral | ✓ | — | Partial | — |
| Multi-Branch | ✓ | ✓ | ✓ | ✓ |
| Franchise Management | ✓ | — | ✓ | — |
| White Label SaaS | ✓ | — | — | — |
| AI BI + Forecasting | ✓ | — | Partial | — |
| Website Builder | ✓ | — | — | — |
| Theme Marketplace | ✓ | — | — | — |
| Abandoned Cart Recovery | ✓ | — | — | — |
| Affiliate System | ✓ | — | — | — |

This file is the single reference for "website ka full function info" — routes, roles, API, main flows, and fixes.
