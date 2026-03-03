## Restro OS – Poora System Overview (Hinglish)

Yeh file developer / auditor ke liye hai, jisme hum **saare features, flows, important functions, panels aur database tables** ko simple Hinglish me explain kar rahe hain.

---

## 1. High‑Level Architecture (Upar‑upar ka design)

- **Frontend**
  - Next.js 14 (App Router) + TypeScript.
  - Tailwind CSS UI, Framer Motion animations.
  - Important contexts:
    - `CartContext` → har restaurant ke liye alag cart (slug ke basis par).
    - `LanguageContext` → Hindi / English toggle.
    - `UserContext` → logged‑in user (customer / admin / staff).
    - `RestaurantPageContext` → current restaurant ka naam / slug / logo / color.
    - `ThemeContext` → Dark / Light / Color‑blind mode.

- **Backend**
  - Node.js + Express + TypeScript.
  - MongoDB (Mongoose models).
  - Razorpay → online order payments + paid subscription payments.
  - Email (Nodemailer) + SMS/WhatsApp integration.
  - Rate limiting, error logging, weekly automatic backup, restore system.

- **Multi‑tenancy (multi‑restaurant system)**
  - Har restaurant‑related record me `restaurantId` ya `slug` hota hai.
  - Restaurant admin / staff ke API calls hamesha `req.user.restaurantId` se filter hote hain.

---

## 2. Frontend Panels & Main Flows

### 2.1 Customer Side (Public website)

- Pages:
  - `/` → marketing landing (features, pricing, CTA).
  - `/r/[slug]` → specific restaurant ka home page.
  - `/menu?restaurant=slug` → us restaurant ka menu + add‑to‑cart.
  - `/cart?restaurant=slug` → sirf usi restaurant ka cart.
  - `/checkout?restaurant=slug` → checkout + GST + delivery.
  - `/booking?restaurant=slug` → table booking UI.

- **Cart system kaise kaam karta hai**
  - `CartContext` localStorage me cart store karta hai:
    - key: `cart:${restaurantSlug}`.
  - Navbar / pages `RestaurantPageContext` se current restaurant slug nikalte hain.
  - Iska result:
    - Khushi Roti ka order kabhi bhi kisi aur restaurant ke cart me mix nahi hota.

- **Checkout & Billing**
  - Frontend:
    - Subtotal + Delivery + GST + Discount calculate karta hai.
  - Backend:
    - Bills / Orders ke andar khud bhi subtotal + GST recompute karta hai.
    - Har jagah GST percentage `Restaurant.taxRate` se aata hai (default 5%).

- **Table booking**
  - Components:
    - `TableLayout` → tables, capacity, status, per‑table rate/offer show karta hai.
    - `booking.utils.ts`:
      - `getBookingConfig(capacity, table?)`:
        - Base `hourlyRate` capacity se.
        - Agar `Table.hourlyRate/discountThreshold/discountAmount` set hain, toh woh override karte hain.
      - `validateAdvanceBooking` → minimum **2 ghante pehle** booking rule.
      - `validateTimeSlot`, `calculateEndTime`.
  - UI:
    - Right panel me “Booking Rules” har waqt visible rehte hain.
    - Discount section:
      - “Get ₹Y OFF when order reaches ₹X”.
      - Explanation lines clear Hinglish me likhi hui.

- **Online payment (orders)**
  - Frontend:
    - `loadRazorpayScript`, `createRazorpayOrder`, `verifyPayment`.
  - Backend (`payment.controller.ts`):
    - `createPaymentOrder`:
      - Razorpay me order create, `key + orderId + amount` frontend ko bhejta hai.
    - `verifyPaymentOrder`:
      - Signature verify, `Order.paymentStatus = 'paid'`, `paymentMethod = 'online'`.
      - `generateBillFromOrderAuto` se bill banata hai.
      - Email + SMS + WhatsApp receipt bhejta hai.

---

### 2.2 Restaurant Admin Panel (`/admin/...`)

- **Access flow**
  - `/admin/login` → agar role `admin` hai to `/admin/dashboard`.
  - Agar role `staff/manager/cashier` hai to `/staff`.
  - `admin/layout.tsx` ensure karta hai ki staff `/admin` routes nahi dekh sakte.

- **Admin sidebar (Restaurant panel)**
  - Dashboard
  - Orders
  - Menu
  - Bookings
  - Table rates & offers
  - Hero Images
  - Billing Panel
  - Payments
  - Revenue
  - Reports
  - Customers
  - Staff & Users
  - Staff roles
  - Reviews
  - Analytics
  - Settings

- **Important features & unke controllers**
  - **Orders**
    - UI: `/admin/orders`.
    - Backend: `order.controller.ts` (`createOrder`, `updateStatus`).
  - **Menu**
    - UI: `/admin/menu`.
    - Backend: `menu.controller.ts`.
    - Model: `Menu` (`Menu.model.ts`).
  - **Bookings**
    - UI: `/admin/bookings`.
    - Backend: `booking.controller.ts` + `table.controller.ts`.
    - `createDefaultTablesForRestaurant` 20 tables bana deta hai.
  - **Table rates & offers**
    - UI: `/admin/table-rates`.
    - Backend:
      - `Table.model.ts` me `hourlyRate`, `discountThreshold`, `discountAmount`.
      - `updateTableRateOffer` (`table.controller.ts`) → `PATCH /tables/:id/rate-offer`.
  - **Billing Panel**
    - UI: `/admin/billing`.
    - Backend: `billing.controller.ts`:
      - `createBillFromOrder` (online order ka bill).
      - `createOfflineBill` (walk‑in).
      - Model: `Bill`.
  - **Revenue**
    - UI: `/admin/revenue`.
    - Backend: `revenue.routes.ts` + `revenue` controllers.
  - **Billing Reports (Reports page)**
    - UI: `/admin/reports`.
    - Backend:
      - `getBillingReportPdf` (`billing.controller.ts`) → `GET /billing/report/pdf`.
      - PDF generation: `pdfkit`.
      - `getBills` me `startDate/endDate` filter for grid view.

---

### 2.3 Staff Panel (`/staff/...`)

- Core idea:
  - Restaurant admin decide karega ki `staff / manager / cashier` ko kaun se sections visible hon:
    - `rolePermissions` field in `Restaurant` model.
  - Staff panel ke sidebar me items filter ho jaate hain:
    - `StaffLayout.tsx`:
      - `/restaurants/me` se `rolePermissions` fetch karta hai.
      - `STAFF_NAV_ITEMS` ko allowed permissions ke basis par filter karta hai.

---

### 2.4 Super Admin Panel (`/admin/super/...`)

#### 2.4.1 Restaurants
- Page: `/admin/super/restaurants`.
- Backend:
  - `superAdmin.routes.ts` → `getAllRestaurants`, `updateRestaurantStatus`, `updateRestaurantFeatures`, `resetRestaurantAdminPassword`.
- Grid:
  - `Restaurant` model se:
    - Naam, slug, owner, status, subscription status, joined date.

#### 2.4.2 Plans & Subscriptions
- Plans:
  - Model: `RentalPlan`.
  - Controller: `rentalPlan.controller.ts`.
- Subscriptions:
  - Model: `Subscription`.
  - Controller: `subscription.controller.ts`.
  - Razorpay webhooks: `subscriptionWebhook.controller.ts`.

#### 2.4.3 Backup & Restore

- **Manual backup**
  - API: `GET /api/super-admin/backup?scope=all|restaurant&restaurantId=...`
  - Controller: `exportBackup` (`backup.controller.ts`).
  - Helper: `buildBackup(scope, restaurantId?)`:
    - Collections:
      - `Restaurant, User, Menu, Order, Bill, Booking, Table, HeroImage, Subscription, RentalPlan, AuditLog`.
  - Frontend: `/admin/super/backup` page:
    - Scope select (Full / Single restaurant).
    - “Download backup JSON”.
    - Neeche grid: saare restaurants + IDs → easy copy.

- **Restore**
  - API: `POST /api/super-admin/backup/import?dryRun=true|false`.
  - Controller: `importBackup`:
    - Mongo transaction.
    - Har collection pe `bulkWrite` + `upsert`.
    - `dryRun=true` → abort transaction, koi write nahi.

- **Auto weekly backup**
  - Service: `backupScheduler.service.ts`:
    - `scheduleWeeklyBackups()` → `cron` `"0 3 * * 0"` Sunday 3AM.
    - Calls `createWeeklyPlatformBackupSnapshot()`.
  - Model: `BackupSnapshot`:
    - `payload` = full backup JSON.
    - `expiresAt` = ab se 6 months aage.
    - TTL index on `expiresAt` → 6 months baad automatic delete.

#### 2.4.4 Error & Bug Control

- Model: `ErrorLog`.
  - Fields:
    - `message, level, statusCode, route, method, userId, restaurantId, stack, status`.
- Error middleware:
  - `errorHandler` in `error.middleware.ts`:
    - `logger.error(...)` + `ErrorLog.create(...)`.
- APIs:
  - `GET /api/super-admin/error-logs` → list with filters.
  - `PATCH /api/super-admin/error-logs/:id/status` → open / investigating / resolved.
  - `POST /api/super-admin/system/scan-repair`:
    - Controller: `scanAndRepairSystem`.
    - Har restaurant ke liye:
      - Agar menu empty → `seedDefaultMenuForRestaurant`.
      - Agar tables 0 → `createDefaultTablesForRestaurant`.
- UI: `/admin/super/errors`:
  - Left table: recent errors.
  - Right panel: details + stack + status buttons.
  - Top button: **“Scan & Auto‑repair”**:
    - Auto missing menu/tables ko fix karta hai.

---

### 2.5 Master Admin Panel (`/admin/master/...`)

- Similar to Super Admin but limited scope:
  - Restaurants, Users, Analytics, Plans, Subscriptions views.
  - Uses `MASTER_ADMIN_NAV` in `Sidebar.tsx`.

---

## 3. Important Database Tables (Models) – Kaun kya store karta hai

### 3.1 Restaurant related

- `Restaurant`:
  - Multi‑tenant core model.
  - Keys:
    - Subscription info: `subscriptionStatus, trialEndsAt, currentPlanId`.
    - Branding: `logo, primaryColor, theme`.
    - Features: `features` object (bool flags).
    - Staff role permissions: `rolePermissions`.

- `User`:
  - Admin / Staff / Customer / Super / Master.
  - Linked to restaurant via `restaurantId` (platform admins ke liye `null`).

### 3.2 Ordering & Billing

- `Menu`:
  - Items per restaurant.
- `Order`:
  - Customer orders.
  - Linked to `Restaurant` & indirectly to `Bill`.
- `Bill`:
  - Final bill for GST & records.
  - Source: `online` / `offline`.

### 3.3 Booking

- `Table`:
  - Physical tables with capacity and section (`window/center/corner/outdoor`).
  - Offer fields: `hourlyRate`, `discountThreshold`, `discountAmount`.
- `Booking`:
  - Table bookings with advance payment, status, and discount info.

### 3.4 Plans & Subscriptions

- `RentalPlan`:
  - SaaS plan configuration.
- `Subscription`:
  - Restaurant ki subscription entries (Trial/Active/etc).

### 3.5 Backups & Errors

- `BackupSnapshot`:
  - Weekly auto‑backups with TTL.
- `ErrorLog`:
  - Central error store for Super Admin bug control.
- `AuditLog`:
  - System audit trail (optional use).
- `PendingRestaurantSignup`:
  - Temporary record jab paid signup chal raha ho, Razorpay payment complete hone se pehle.

---

## 4. Restaurant Signup & Subscription Flow (Detail)

### 4.1 Free Trial

1. `/restaurant/signup` par form submit.
2. `restaurantSignup` controller:
   - `Restaurant` create with `subscriptionStatus = 'trial'`.
   - `Subscription` create with `amount = 0`, period = trialDays.
   - Admin `User` create.
   - Default menu + tables seed.

### 4.2 Paid (Online) Subscription

1. User **Paid subscription (online payment)** option choose karta hai.
2. Frontend `POST /restaurants/signup/payment-order`:
   - Backend: Razorpay order create + `PendingRestaurantSignup` entry save.
3. Razorpay checkout open hota hai:
   - Success → handler se `POST /restaurants/signup/verify-payment`.
4. `restaurantSignupVerifyPayment`:
   - Signature verify.
   - `PendingRestaurantSignup` leke:
     - `Restaurant` create with `subscriptionStatus = 'active'`.
     - `Subscription` create with `amount = plan.price`, `paymentMethod = 'online'`, `paymentId` set.
     - Admin user create.
     - Default menu + tables seed.
   - Pending signup ko `completed` mark karta hai.

**Important guarantee:**  
- Agar Razorpay payment **cancel** ya **fail** ho, to:
  - `verify-payment` call nahi hota.
  - Restaurant/subscription **create nahi hota**.

---

Yeh `info-hindi.md` file Restro OS ka **high‑level technical map** hai – isko padkar koi bhi developer samajh sakta hai ki:

- Kaun sa panel kya karta hai.
- Kaun se controllers / routes / models use ho rahe hain.
- Backup, error handling, booking, billing, subscription sab kaise connected hain. 

Naye feature add karte waqt is file ko update rakhna recommended hai. 

