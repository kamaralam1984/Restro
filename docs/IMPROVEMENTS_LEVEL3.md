# Level 3+ Improvements Implemented

## ✅ A. Payment automation (recurring, grace, suspend)

- **Email on expiry**: When a subscription or trial expires, the system sends a **subscription expired** email to the restaurant owner (see Email automation).
- **Razorpay subscription webhook** (`POST /api/webhooks/razorpay`):
  - **subscription.charged**: Renews subscription (updates `endDate`, `nextBillingDate`), sets restaurant `status: active`, clears `gracePeriodEndsAt`.
  - **subscription.cancelled**: Sets subscription `status: cancelled`.
  - **payment.failed**: Sets subscription `status: past_due` and `gracePeriodEndsAt` = now + `SUBSCRIPTION_GRACE_DAYS` (default 3). Cron then suspends restaurant when grace period ends.
- **Subscription model**: `razorpaySubscriptionId`, `razorpayPlanId`, `gracePeriodEndsAt`. Cron in `subscriptionExpiry.service` processes both expired `endDate` and past-due subscriptions past `gracePeriodEndsAt` (suspend restaurant + expiry email).
- **Env**: `RAZORPAY_WEBHOOK_SECRET` (from Razorpay dashboard for this webhook URL), `SUBSCRIPTION_GRACE_DAYS` (optional, default 3).

## ✅ B. Centralized logging (production level)

- **Winston** in `backend/src/config/logger.ts`:
  - Log levels: `error`, `warn`, `info`, `debug` (controlled by `LOG_LEVEL`).
  - Console output (colored in dev, JSON in prod).
  - Production: writes to `logs/app.log` and `logs/error.log` (create `logs/` if needed).
- **Usage**: `logger.info('msg')`, `logger.error('msg', { err, id })`. Existing `utils/logger` re-exports this.
- **Optional**: Add `winston-daily-rotate-file` for rotation; or use logrotate on `logs/*.log`.
- **Sentry**: Set `SENTRY_DSN` in env and add `@sentry/node` in error middleware to report errors.

## ✅ C. Rate limiting per tenant

- **Per-tenant limiter** in `backend/src/middleware/rateLimiter.middleware.ts`:
  - Key: `tenant:${restaurantId}` when available (from auth or headers), else `ip:${ip}`.
  - **tenantApiRateLimiter**: 300 req/min per tenant (or per IP if unauthenticated).
  - **Abuse detection**: Logs a warning when a tenant reaches 80% of limit and when limit is exceeded.
- Applied on `/api/orders` and `/api/bookings` in addition to global `apiRateLimiter`.

## ✅ D. Redis caching

- **Client**: `backend/src/config/redis.ts` – `getRedis()` returns ioredis client when `REDIS_URI` is set; otherwise cache layer uses in-memory store (per process).
- **Cache layer**: `backend/src/utils/cache.ts` – `cacheGet`, `cacheSet`, `cacheDel`; keys: `menu:{restaurantId}`, `restaurant:slug:{slug}`, `analytics:dashboard:{restaurantId}`.
- **Usage**:
  - **Menu**: `GET /api/menu?restaurant=slug` (simple list: page 1, default sort, no filters) → cache 5 min; invalidated on menu create/update/delete for that restaurant.
  - **Restaurant by slug**: `GET /api/restaurants/by-slug/:slug` → cache 5 min; invalidated on restaurant update.
  - **Analytics dashboard**: `GET /api/analytics/dashboard` (when `req.user.restaurantId` is set) → cache 2 min.
- **Env**: `REDIS_URI` (optional). If unset, in-memory cache is used (suitable for single-instance dev).

## ✅ E. Onboarding wizard (UI)

- **Steps**: 1) Add Menu → 2) Add Tables → 3) Razorpay Keys → 4) Publish.
- **Backend**: `Restaurant.onboardingStep` and `onboardingCompletedAt`.  
  - `GET /api/restaurants/me/onboarding`  
  - `PATCH /api/restaurants/me/onboarding` with `{ step: 'tables' }` or `{ completed: true }`.
- **Frontend**: `/admin/onboarding` – progress bar, step copy, “Go to step”, “Skip”, “Skip onboarding and go to dashboard” (marks completed).
- **Redirect**: Rental admin layout checks onboarding; if not completed, redirects to `/admin/onboarding` (except when already on that page).

## ✅ F. Email automation

- **Trial ending reminder**: `sendTrialEndingReminder({ toEmail, restaurantName, daysLeft, storeLink })` in `utils/email.ts`. Wire to a cron that finds restaurants with `trialEndsAt` in 2 days and sends to owner.
- **Subscription expired**: Sent automatically when `processExpiredSubscriptions` marks a restaurant inactive (owner email from User with role `admin`).
- **Daily sales summary**: `sendDailySalesSummary({ toEmail, restaurantName, date, totalOrders, totalRevenue, storeLink })`. Run daily (e.g. 9 AM) per restaurant; aggregate orders/revenue for previous day and send.

## ✅ G. White-label domain support

- **Restaurant model**: `customDomain` (e.g. `order.restaurant.com`).
- **Docs**: `docs/WHITE_LABEL_DOMAIN.md` – CNAME setup, resolving tenant by `Host` header, optional middleware example, SSL note.
- **Frontend**: Use request host / `window.location.hostname` and pass to API or resolve tenant as needed.

---

## Quick reference

| Item              | Status   | Location / note                                      |
|-------------------|----------|------------------------------------------------------|
| Winston logging   | Done     | `config/logger.ts`, `server.ts`, `utils/logger`      |
| Per-tenant limit | Done     | `rateLimiter.middleware.ts`, `app.ts`                |
| Onboarding wizard| Done     | `admin/onboarding` page, `Restaurant` model, API    |
| Email automation | Done     | `utils/email.ts`, `subscriptionExpiry.service.ts`   |
| White-label      | Doc + model | `Restaurant.customDomain`, `WHITE_LABEL_DOMAIN.md` |
| Razorpay auto-renew | Done | `subscriptionWebhook.controller`, Subscription model, cron |
| Redis cache      | Done  | `config/redis.ts`, `utils/cache.ts`, menu/restaurant/analytics |
