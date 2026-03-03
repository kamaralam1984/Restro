## Restro OS – System & Feature Overview (`info` file)

This file explains **how the whole system works** – features, flows, important functions, admin panels, and database tables – so a developer or auditor can quickly understand Restro OS end‑to‑end.

---

## 1. High‑Level Architecture

- **Frontend**
  - Next.js 14 (App Router) + TypeScript.
  - Tailwind CSS for styling, Framer Motion for animations.
  - Context providers:
    - `CartContext` – restaurant‑specific cart per slug.
    - `LanguageContext` – Hindi/English.
    - `UserContext` – logged‑in customer/admin/staff.
    - `RestaurantPageContext` – current restaurant branding (slug, name, logo, color).
    - `ThemeContext` – light / dark / color‑blind modes.
  - Panels:
    - Customer storefront (`/r/[slug]`, `/menu`, `/booking`, `/cart`, `/checkout`).
    - Restaurant Admin panel (`/admin/...`).
    - Staff panel (`/staff/...`).
    - Super Admin panel (`/admin/super/...`).
    - Master Admin panel (`/admin/master/...`).

- **Backend**
  - Node.js + Express + TypeScript (ES modules).
  - MongoDB (Mongoose) for all data.
  - Razorpay for online order payments and subscription payments.
  - Nodemailer + SMS/WhatsApp integration for notifications.
  - Rate limiting, error logging, backup & restore, automatic weekly backups.

- **Multi‑tenancy**
  - Every restaurant‑level record has `restaurantId` or `slug`.
  - API routes for restaurant admins/staff always filter by `req.user.restaurantId`.

---

## 2. Frontend Panels & Flows

### 2.1 Customer Side (Public Storefront)

**Key pages**
- `/` – marketing landing page (plans, features, CTAs to signup).
- `/r/[slug]` – specific restaurant storefront.
- `/menu?restaurant=slug` – menu page with add‑to‑cart.
- `/cart?restaurant=slug` – restaurant‑specific cart.
- `/checkout?restaurant=slug` – checkout for that restaurant.
- `/booking?restaurant=slug` – table booking.
- `/contact` – contact form.

**Cart system**
- Implemented in `CartContext`:
  - Stores carts in `localStorage` with **key per restaurant slug**.
  - When you are on `/r/[slug]` or `/menu?restaurant=slug`, `RestaurantPageContext` is set and cart reads/writes using that slug.
  - This guarantees:
    - Orders from **Khushi Roti Resturen** go to that restaurant’s cart.
    - Orders from any other restaurant are completely separate.

**Checkout + Billing**
- Cart summary:
  - **Subtotal** – sum of item totals.
  - **Delivery** – configured per restaurant.
  - **GST** – `restaurant.taxRate` (default 5%).
  - **Discounts** – applied based on coupons or booking offers.
- These values are passed to backend when creating orders/bills; backend recomputes and trusts frontend total if valid, but also independently recalculates tax and discounts to ensure consistency.

**Table booking**
- Booking UI (`/booking`) uses:
  - `TableLayout` component to show tables and availability.
  - `booking.utils.ts` functions:
    - `validateAdvanceBooking` – must be **at least 2 hours** before slot.
    - `validateTimeSlot` – must be within configured hours (`BOOKING_TIME_SLOTS`).
    - `calculateEndTime` – end time from start + hours.
    - `getBookingConfig(capacity, table?)` – calculates:
      - `hourlyRate`
      - `discountThreshold` (order total to qualify for discount)
      - `discountAmount` (usually 1 hour free).
  - Per‑table rates/offers:
    - `TableLayout` passes full table (`capacity`, `hourlyRate`, `discountThreshold`, `discountAmount`) to booking page.
    - Booking page uses these to show:
      - “Get ₹Y OFF when order reaches ₹X” + explanation lines.

**Booking rules**
- Right‑side panel on booking page shows:
  - Always‑visible booking rules (advance 2 hours, slot times, no‑show rule, group size guidance, etc.).

**Online order payment**
- Customer orders use Razorpay via:
  - `loadRazorpayScript` + `createRazorpayOrder` + `verifyPayment` in `frontend/src/utils/razorpay.ts`.
  - Backend `payment.controller.ts`:
    - `createPaymentOrder` → Razorpay order for given amount.
    - `verifyPaymentOrder` → verifies signature, marks `Order.paymentStatus = 'paid'`, generates `Bill`, sends receipt via email/SMS/WhatsApp.

---

### 2.2 Restaurant Admin Panel (`/admin/...`)

**Access & routing**
- Admin login (`/admin/login`):
  - If role = `admin` → redirect `/admin/dashboard`.
  - Other staff roles redirect to `/staff`.
- `admin/layout.tsx`:
  - Blocks non‑admin staff from `/admin` routes.
  - Wraps pages in `AdminLayout` (sidebar + header).

**Sidebar items (Restaurant Admin)**
- Dashboard
- Orders
- Menu
- Bookings
- Table rates & offers
- Hero Images
- Billing Panel
- Payments
- Revenue
- Reports (PDF + grid)
- Customers
- Staff & Users
- Staff roles
- Reviews
- Analytics
- Settings

**Key admin features**
- **Dashboard** – today’s orders, revenue, pending orders, online vs COD ratio.
- **Orders** – filter by status, update order state (`pending, confirmed, preparing, ready, completed, cancelled`).
- **Menu** – full CRUD on menu items:
  - Name, description, price, category, veg/non‑veg, image, add‑ons.
- **Bookings** – manage table bookings (confirm/cancel/complete), and initialize default tables.
- **Table rates & offers**
  - Grid over `Table` model:
    - Override `hourlyRate`, `discountThreshold`, `discountAmount` per table.
  - Saved via `PATCH /api/tables/:id/rate-offer`.
- **Billing Panel**
  - Generate bills from:
    - Online orders (already paid).
    - Offline walk‑in customers (cash or card).
  - GST and delivery charge applied.
  - Optionally send receipts to customer (email, SMS, WhatsApp).
- **Revenue**
  - Revenue stats over orders + bills:
    - Total revenue, orders, customers, average values.
    - Daily revenue chart.
    - Top selling items.
  - Export to CSV.
- **Reports (Billing Reports / GST / Audit)**
  - Page: `/admin/reports`.
  - Filters:
    - Period: Today, This week, This month, This year.
    - OR custom date range (startDate–endDate).
  - **Grid view**:
    - For selected range, list of all bills:
      - Date/time, bill number, source (online/offline), subtotal, GST, discount, grand total, payment, status.
  - **PDF Download**:
    - Calls `GET /api/billing/report/pdf`:
      - Backend uses `pdfkit` to generate report:
        - Summary totals (Subtotal, GST, Discount, Delivery, Grand Total).
        - Line‑by‑line bill list.
      - Response is a downloadable PDF.

**Settings page (Admin)**
- Notification settings:
  - Notification email & WhatsApp number per restaurant.
- Website theme:
  - Predefined theme palette or custom primary color.
- Staff role access:
  - Matrix for sections each role can see in staff panel.

---

### 2.3 Staff Panel (`/staff/...`)

**Access**
- Staff login uses `/admin/login` but:
  - If role = `staff/manager/cashier` → redirect to `/staff`.
  - Admin cannot see staff panel (they stay in `/admin`).
- `StaffLayout`:
  - Authenticates staff.
  - Fetches `rolePermissions` from restaurant.
  - Builds a filtered sidebar based on allowed sections (dashboard, orders, bookings, billing, etc.).
  - Sets `RestaurantPageContext` so Navbar branding uses current restaurant.

**Staff sidebar sections**
- Dashboard
- Orders
- Menu (read‑only)
- Bookings
- Hero images
- Billing
- Payments
- Revenue
- Customers
- Reviews
- Analytics

Permissions for these sections are controlled by restaurant admin through **Staff roles** matrix.

---

### 2.4 Super Admin Panel (`/admin/super/...`)

**Sidebar items**
- Restaurants
- Users
- Analytics
- Visitors
- Plans
- Subscriptions
- Backup & Restore
- Error & Bug Control

**Main sections**

1. **Restaurants**
   - List all restaurants with:
     - Name, slug, owner, status, subscription status (trial/active/suspended/cancelled), joined date.
   - Add Restaurant:
     - Creates restaurant + rental admin using selected plan.
   - Manage:
     - Open per‑restaurant control page (features, settings).
   - Toggle status:
     - Active / Suspended.

2. **Plans & Subscriptions**
   - Plans (`RentalPlan` model):
     - Name, price, yearly price, included features, trial days.
   - Subscriptions:
     - `Subscription` model:
       - `restaurantId`, `planId`, `status`, `amount`, `billingCycle`, `startDate`, `endDate`, `autoRenew`, `razorpaySubscriptionId` (for Razorpay recurring).
   - `subscriptionWebhook.controller.ts`:
     - Handles Razorpay subscription webhooks:
       - `subscription.charged` → extend subscription, set restaurant `subscriptionStatus = 'active'`.
       - `subscription.cancelled` → mark subscription cancelled.
       - `payment.failed` → set `past_due` + grace period.

3. **Analytics**
   - Platform‑wide revenue, active restaurants, subscription stats.

4. **Visitors**
   - `Visitor` model captures traffic, messages; used for analytics.

5. **Backup & Restore**
   - Page: `/admin/super/backup`.
   - **Export backup**:
     - Options:
       - `Full platform` (`scope=all`).
       - `Single restaurant` (`scope=restaurant&restaurantId=...`).
     - Calls `GET /api/super-admin/backup`.
     - Backend:
       - Uses `buildBackup(scope, restaurantId?)` in `backup.controller.ts`.
       - Bundles:
         - `restaurants, users, menus, orders, bills, bookings, tables, heroImages, subscriptions, rentalPlans, auditLogs`.
       - Returns JSON file: `restro-os-backup-{scope}-YYYY-MM-DD.json`.
   - **Import / Restore**:
     - Upload backup JSON and choose:
       - **Dry run only (no write)**.
       - Or actual restore.
     - Calls `POST /api/super-admin/backup/import?dryRun=true|false`.
     - Backend:
       - Opens MongoDB transaction.
       - For each array in payload:
         - Performs `bulkWrite` with `upsert: true`.
       - On dry run → abort transaction → no writes.
       - On real restore → commit transaction.
   - **Restaurant IDs helper grid**:
     - Lists all restaurants (name, slug, ID, status, subscription) to easily copy `restaurantId` for backup scopes.

6. **Error & Bug Control**
   - Page: `/admin/super/errors`.
   - Backend:
     - `ErrorLog` model:
       - `message, statusCode, route, method, userId, restaurantId, stack, status`.
     - `error.middleware.ts`:
       - On any Express error, logs via `logger.error` **and** inserts into `ErrorLog`.
     - Routes:
       - `GET /api/super-admin/error-logs` – list logs with filters (`status`, `restaurantId`).
       - `PATCH /api/super-admin/error-logs/:id/status` – mark as `open / investigating / resolved`.
       - `POST /api/super-admin/system/scan-repair` – scan all restaurants and auto repair missing defaults.
   - UI:
     - Filters by status (All, Open, Investigating, Resolved) and search (message/route/stack).
     - Grid of errors:
       - Time, route, message, status, HTTP status.
     - Detail panel:
       - Stack trace, IDs, and buttons:
         - Mark as Investigating.
         - Mark as Resolved.
     - **Scan & Auto‑repair** button:
       - Calls `/super-admin/system/scan-repair` with `{ repair: true }`.
       - Backend:
         - For each restaurant:
           - Checks if menu empty → seeds default menu.
           - Checks if tables empty → creates 20 default tables.
         - Returns summary; UI shows how many restaurants were auto‑repaired.

---

### 2.5 Master Admin Panel (`/admin/master/...`)

- Similar to Super Admin but scoped to:
  - Managing restaurants for a master account group.
  - Managing users, plans, subscriptions.
- Uses `MASTER_ADMIN_NAV` in `Sidebar.tsx` and `PanelType = 'master'`.

---

## 3. Database Models & Relationships

### 3.1 Core Multi‑tenant Models

- `Restaurant`
  - Fields:
    - `name, slug, phone, address, country`.
    - Subscription fields:
      - `subscriptionStatus`: `'trial' | 'active' | 'suspended' | 'cancelled'`.
      - `trialEndsAt`, `currentPlanId`.
    - Branding:
      - `logo, primaryColor, theme`.
    - `features` object: toggles like `billing, onlinePayments, analytics, staffControl, menuManagement, tableBooking`, etc.
    - `rolePermissions`:
      - Allowed sections per staff role (staff, manager, cashier).
    - `notificationEmail`, WhatsApp settings.
  - Relations:
    - `User.restaurantId`.
    - `Menu.restaurantId`.
    - `Order.restaurantId`.
    - `Bill.restaurantId`.
    - `Booking.restaurantId`.
    - `Table.restaurantId`.
    - `HeroImage.restaurantId`.
    - `Subscription.restaurantId`.

- `User`
  - Fields:
    - `name, email, phone`.
    - `role`: `'super_admin' | 'master_admin' | 'admin' | 'manager' | 'staff' | 'cashier' | 'customer'`.
    - `password` (hashed).
    - `restaurantId` for restaurant‑level users; `null` for platform admins.
  - Indices:
    - Unique email per restaurant.
  - Used in:
    - Auth token payload (`req.user`).
    - `ErrorLog.userId`, `AuditLog.userId`, `Bill.generatedBy`.

### 3.2 Menu & Orders

- `Menu`
  - `restaurantId`, `name`, `description`, `price`, `category`, `veg`, `image`, `addOns`, `isDeleted`.
  - Seeded for new restaurants using `DEFAULT_MENU_ITEMS` via `seedDefaultMenuForRestaurant`.

- `Order`
  - `restaurantId`, `orderNumber`, `items`, `total`.
  - `tableNumber` (optionally from booking).
  - `status` and `paymentStatus`, `paymentMethod`, `paymentId`.
  - Relationships:
    - `Bill.orderId` references this when billing.
    - Booking discount logic (if order relates to a booking with discount promotion).

### 3.3 Billing & Revenue

- `Bill`
  - Fields:
    - `restaurantId`, `billNumber`, `source` (`online` | `offline`).
    - `orderId`, `orderNumber`.
    - Customer info.
    - `items` (name, quantity, price, total).
    - `subtotal, taxAmount, discountAmount, deliveryCharge, grandTotal`.
    - `paymentMethod`, `status`.
    - `generatedBy` (`User` id).
  - Used in:
    - Revenue stats.
    - GST/Audit reports (PDF & grid).

### 3.4 Booking & Tables

- `Table`
  - `restaurantId`, `tableNumber`, `capacity`, `status`, `location`.
  - **Custom pricing fields**:
    - `hourlyRate?`, `discountThreshold?`, `discountAmount?`.
  - Created in bulk:
    - On restaurant signup.
    - Via Admin “Initialize tables” action.
  - Used in:
    - Booking layout (availability).
    - Booking discount engine via `getBookingConfig(capacity, table)`.

- `Booking`
  - `restaurantId`, `tableNumber`, `bookingHours`, `status`, `advancePayment`, `totalBookingAmount`, `discountApplied`.
  - Used to compute booking‑based order discounts.

### 3.5 Subscriptions & Plans

- `RentalPlan`
  - `name`, `price`, `yearlyPrice`, `features`, `trialDays`, `isActive`, `sortOrder`.

- `Subscription`
  - `restaurantId`, `planId`.
  - `status`: `'active' | 'expired' | 'cancelled' | 'past_due'`.
  - `amount`, `currency`, `billingCycle`, `startDate`, `endDate`, `nextBillingDate`, `autoRenew`, `paymentMethod`, `paymentId`, `razorpaySubscriptionId`.
  - Drives restaurant’s `subscriptionStatus`.

### 3.6 Backups

- `BackupSnapshot`
  - Auto weekly platform backup snapshots:
    - `scope`: `'all' | 'restaurant'` (auto job uses `'all'`).
    - `restaurantId?` (null for full platform).
    - `payload`: full backup JSON (same structure as manual export).
    - `expiresAt`: 6 months ahead.
  - TTL index:
    - `expiresAt` with `expireAfterSeconds: 0` → MongoDB auto deletes older than 6 months.
  - Created by:
    - `scheduleWeeklyBackups()` in `backupScheduler.service.ts`, called from `app.ts`.

### 3.7 Error & Audit

- `ErrorLog`
  - For capturing backend errors:
    - `level, message, statusCode, route, method, userId, restaurantId, stack, status`.
  - Filled by `errorHandler` middleware.

- `AuditLog`
  - For manual audit events (menu edits, orders, etc.) as needed.

### 3.8 PendingSignup (Paid)

- `PendingRestaurantSignup`
  - Temporary record when user chooses **paid subscription** on signup:
    - `name, slug, email, adminPasswordHash, adminName, adminPhone, planId, razorpayOrderId, status`.
  - TTL:
    - Auto expires after 1 day.
  - Flow:
    - Created in `restaurantSignupPaymentOrder`.
    - Finalized in `restaurantSignupVerifyPayment` after payment verification.

---

## 4. Signup & Subscription Flows

### 4.1 Restaurant Free Trial Signup (Current Default)

1. User submits `/restaurant/signup` with **Free trial** mode.
2. Frontend `POST /api/restaurants/signup`.
3. Backend `restaurantSignup`:
   - Validates name, slug, email, password.
   - Ensures slug is unique.
   - Chooses plan by `planId` or first active plan.
   - Computes `trialEnd = now + plan.trialDays`.
   - Creates `Restaurant` with `subscriptionStatus = 'trial'`.
   - Creates `Subscription` with status active, amount 0, period = trial.
   - Creates `User` (admin).
   - Seeds default menu and tables (non‑blocking).
   - Returns login URL and store link.

### 4.2 Restaurant Paid Signup with Razorpay

1. User selects **Paid subscription (online payment)** radio.
2. On submit, frontend posts to `POST /api/restaurants/signup/payment-order` with full form.
3. Backend `restaurantSignupPaymentOrder`:
   - Validates all fields.
   - Ensures slug is available.
   - Loads `RentalPlan` and uses `plan.price`.
   - Checks `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
   - Calls `createRazorpayOrder(amount)`.
   - Hashes admin password.
   - Creates `PendingRestaurantSignup` with order id.
   - Returns `key, razorpayOrderId, amount, currency, pendingId`.
4. Frontend:
   - Loads Razorpay script.
   - Opens Razorpay checkout with given order/key.
   - On **success**:
     - Sends `POST /api/restaurants/signup/verify-payment` with:
       - `pendingId, razorpay_order_id, razorpay_payment_id, razorpay_signature`.
   - On **cancel**:
     - Shows toast; no restaurant is created.
5. Backend `restaurantSignupVerifyPayment`:
   - Verifies signature via `verifyPayment`.
   - Loads `PendingRestaurantSignup` in a transaction; ensures status = pending.
   - Ensures slug is still unique.
   - Loads `RentalPlan`.
   - Creates `Restaurant` with **active subscription**:
     - `subscriptionStatus = 'active'`.
   - Creates `Subscription` with:
     - `status = 'active'`, `amount = plan.price`, `paymentMethod = 'online'`, `paymentId = razorpay_payment_id`.
   - Creates admin `User` with stored hash.
   - Marks pending signup as `completed`.
   - Seeds default menu and tables.
   - Returns success + login URL.

Result: **Paid subscription only activates when online payment succeeds.** If Razorpay payment fails or is cancelled, no restaurant/subscription is created.

---

## 5. Theme & Accessibility

- Global CSS in `globals.css` defines CSS variables:
  - `--background, --foreground, --accent, --danger, --success`.
- `ThemeContext` + `ThemeSwitcher` in Navbar:
  - Modes:
    - `dark` – default (slate background, light text).
    - `light` – white background, dark text; overrides many `bg-slate-*` and `text-slate-*` classes.
    - `colorblind` – high‑contrast palette, avoids confusing red/green combinations.
  - Theme persists in `localStorage` (`restro-theme`).
  - The `<html>` element receives `theme-light` or `theme-colorblind` class, guiding overrides.

---

This `info` file intentionally focuses on **how features and systems work under the hood**, which files are involved, and how data flows through the database and panels. It should be kept up to date whenever new major modules or flows are added. 

