# ELARIS Bug Registry

This registry tracks all bugs, security flaws, concurrency race conditions, and silent error maskings discovered during the ELARIS diagnostic phase.

---

### BUG-01: Schema / Migration Drift — Missing `guestToken` on `Order` Table
* **BUG ID**: BUG-01
* **Reproducible Steps**:
  1. Deploy migrations onto a clean database via `prisma migrate deploy`.
  2. Attempt to create a guest order via `POST /api/orders` without an active session.
* **Expected Behavior**: Order record is created with a cryptographically secure `guestToken` stored in PostgreSQL.
* **Actual Behavior**: Fails with `PrismaClientKnownRequestError: The column guestToken of relation Order does not exist in the current database`.
* **Evidence**: `prisma/schema.prisma:552` declares `guestToken String? @unique`, but `prisma/migrations/20260902165854_init/migration.sql` does not define `guestToken`.
* **Root Cause**: Schema was edited without generating and committing an incremental migration file (`prisma migrate dev --name add_order_guest_token`).
* **Affected Layers**: Database Schema, Orders API (`/api/orders`, `/api/orders/[id]`).
* **Severity**: **HIGH** (Blocks all guest checkout order completions on freshly deployed databases).
* **Proposed Fix**: Create migration `prisma/migrations/<timestamp>_add_order_guest_token/migration.sql` with `ALTER TABLE "Order" ADD COLUMN "guestToken" TEXT; CREATE UNIQUE INDEX "Order_guestToken_key" ON "Order"("guestToken");`.
* **Regression Test**: `tests/integration/order.test.ts` ("assigns guestToken and stores guest contact details for unauthenticated guest orders").

---

### BUG-02: Concurrency Race Condition in Cart Creation (`getOrCreateCart`)
* **BUG ID**: BUG-02
* **Reproducible Steps**:
  1. Generate an anonymous ID.
  2. Dispatch 5 concurrent `POST /api/cart` or `GET /api/cart` requests simultaneously with the same `cart_anon_id`.
* **Expected Behavior**: Exactly one active cart is created; all requests bind to the single cart instance.
* **Actual Behavior**: Multiple active carts are created in PostgreSQL for the same `anonymousId`.
* **Evidence**: `app/api/cart/route.ts:18-58` performs a non-atomic `findFirst` followed by `cart.create`. `prisma/schema.prisma:445` specifies `@@index([anonymousId, status])` (non-unique index).
* **Root Cause**: Check-then-act pattern without row-level locking or unique composite constraint on `(anonymousId, status)`.
* **Affected Layers**: Cart API, Database.
* **Severity**: **MEDIUM** (Data duplication, fragmented cart items across multiple records).
* **Proposed Fix**: Use `upsert` or add a partial unique index in PostgreSQL: `CREATE UNIQUE INDEX "cart_active_anon_idx" ON "Cart"("anonymousId") WHERE "status" = 'ACTIVE';`.
* **Regression Test**: `tests/integration/concurrency-cart.test.ts` ("exposes race condition: concurrent getOrCreateCart calls create duplicate active carts without unique constraint").

---

### BUG-03: Lack of Checkout Idempotency Handling in `POST /api/orders`
* **BUG ID**: BUG-03
* **Reproducible Steps**:
  1. Submit two identical `POST /api/orders` requests with the same cart items within 50ms (simulating client double-click or network retry).
* **Expected Behavior**: Second request is recognized as a duplicate and returns the existing order without deducting stock or re-billing.
* **Actual Behavior**: Two separate orders with distinct `orderNumber`s are created; inventory is reserved twice.
* **Evidence**: `app/api/orders/route.ts` lacks any `Idempotency-Key` header parsing or order deduplication table.
* **Root Cause**: Absence of server-side idempotency lock or deduplication key on the order engine.
* **Affected Layers**: Orders API, Payment Processing, Inventory.
* **Severity**: **HIGH** (Risk of duplicate charges, double stock deduction, customer frustration).
* **Proposed Fix**: Add `Idempotency-Key` header validation and persist keys with order IDs in an `IdempotencyKey` table using a unique index.
* **Regression Test**: `tests/integration/concurrency-idempotency.test.ts` ("exposes lack of idempotency: multiple identical rapid requests create duplicate orders").

---

### BUG-04: Silent Error Masking in `features/catalog/data.ts:getAllProducts`
* **BUG ID**: BUG-04
* **Reproducible Steps**:
  1. Stop or disconnect PostgreSQL database.
  2. Invoke `getAllProducts()`.
* **Expected Behavior**: Throws a descriptive database error or returns a typed failure result to trigger upstream error boundaries.
* **Actual Behavior**: Logs `[catalog:db]` to stdout and silently returns an empty array `[]`.
* **Evidence**: `features/catalog/data.ts:167-170`:
  ```ts
  } catch (err) {
    console.error("[catalog:db]", err);
    return [];
  }
  ```
* **Root Cause**: Catch-and-ignore anti-pattern returning empty collections on database outages.
* **Affected Layers**: Catalog Service, Public APIs, Sitemap generation.
* **Severity**: **MEDIUM** (Clients receive 200 OK with empty product catalog, masking database failures from monitoring systems).
* **Proposed Fix**: Remove empty fallback; allow error to propagate to Next.js error boundary or return a typed `Result<CatalogProduct[], DatabaseError>`.
* **Regression Test**: `tests/integration/network-resilience.test.ts` ("database disconnection is caught and reported as degraded/503").

---

### BUG-05: Silent Error Masking in `features/catalog/data.ts:getFilteredProducts`
* **BUG ID**: BUG-05
* **Reproducible Steps**:
  1. Trigger a database failure while calling `getFilteredProducts({ category: "apparel" })`.
* **Expected Behavior**: Error is propagated so the UI can display a retry banner.
* **Actual Behavior**: Silently returns `[]`, indicating no products exist in the category.
* **Evidence**: `features/catalog/data.ts:235-238`:
  ```ts
  } catch (err) {
    console.error("[catalog:getFilteredProducts]", err);
    return [];
  }
  ```
* **Root Cause**: Catch block swallows errors and substitutes `[]`.
* **Affected Layers**: Catalog Service, Search API (`/api/search`).
* **Severity**: **MEDIUM** (Masks search service degradation).
* **Proposed Fix**: Surface failure to the search route handler and return HTTP 503 Service Unavailable.
* **Regression Test**: Documented in `tests/integration/network-resilience.test.ts`.

---

### BUG-06: Silent Error Masking in `features/catalog/data.ts:getProductBySlug`
* **BUG ID**: BUG-06
* **Reproducible Steps**:
  1. Request a product detail page when database connection pool is exhausted.
* **Expected Behavior**: 500/503 server error displayed.
* **Actual Behavior**: Silently returns `undefined`, triggering a false 404 Not Found.
* **Evidence**: `features/catalog/data.ts:253-256`:
  ```ts
  } catch (err) {
    console.error("[catalog:getProductBySlug]", err);
    return undefined;
  }
  ```
* **Root Cause**: Database error converted into missing record `undefined`.
* **Affected Layers**: Product Detail Page (`/products/[slug]`).
* **Severity**: **MEDIUM** (Misleads customers and search engines that existing products were deleted).
* **Proposed Fix**: Distinguish record not found (`null`) from connection error (throw).
* **Regression Test**: Documented in `tests/integration/network-resilience.test.ts`.

---

### BUG-07: Silent Error Masking in `features/catalog/data.ts:getProductReviews`
* **BUG ID**: BUG-07
* **Reproducible Steps**:
  1. Fetch reviews while review table has a lock timeout.
* **Expected Behavior**: Error is reported.
* **Actual Behavior**: Silently returns `{ averageRating: 0, totalCount: 0, verifiedCount: 0, reviews: [] }`.
* **Evidence**: `features/catalog/data.ts:339-347`.
* **Root Cause**: Fallback object returned in catch block.
* **Affected Layers**: Reviews display on PDP.
* **Severity**: **LOW** (Masks review subsystem issues).
* **Proposed Fix**: Log error and let caller know review fetching failed.
* **Regression Test**: Documented in `tests/integration/network-resilience.test.ts`.

---

### BUG-08: Hardcoded Fallback Values in `features/catalog/data.ts:getCatalogHighlights`
* **BUG ID**: BUG-08
* **Reproducible Steps**:
  1. Inspect `getCatalogHighlights()` response.
* **Expected Behavior**: Categories and offers are queried from database tables `Category` and `Coupon`/`Promotion`.
* **Actual Behavior**: Returns static in-memory objects `defaultCategories` and `defaultOffers`.
* **Evidence**: `features/catalog/data.ts:58-90, 361-362`.
* **Root Cause**: Development mock data left in production data layer.
* **Affected Layers**: Homepage highlights, storefront landing page.
* **Severity**: **LOW** (Stale content; admin category changes not reflected on homepage highlights).
* **Proposed Fix**: Query active categories and promotions from database with fallback only in offline build context.
* **Regression Test**: `tests/integration/cart.test.ts`.

---

### BUG-09: Unhandled Background Promise in COD Risk Scoring
* **BUG ID**: BUG-09
* **Reproducible Steps**:
  1. Place an order with `paymentProvider: "COD"`.
* **Expected Behavior**: Risk scoring errors are monitored or logged to audit facility.
* **Actual Behavior**: Error is silently swallowed via `.catch(() => undefined)`.
* **Evidence**: `app/api/orders/route.ts:423`:
  ```ts
  computeAndStoreRisk(order.id, session?.userId, input.email).catch(() => undefined);
  ```
* **Root Cause**: Fire-and-forget pattern with catch-and-ignore.
* **Affected Layers**: Risk Assessment subsystem.
* **Severity**: **LOW** (Risk engine failures go unnoticed).
* **Proposed Fix**: Log error with Sentry or application logger in the catch handler.
* **Regression Test**: `tests/integration/security-negative.test.ts`.

---

### BUG-10: Unhandled Background Promise in Order Confirmation Email
* **BUG ID**: BUG-10
* **Reproducible Steps**:
  1. Place an order when Brevo email API credentials or network is down.
* **Expected Behavior**: Notification delivery failure is captured in a dead-letter queue or logged.
* **Actual Behavior**: Error is swallowed via `.catch(() => undefined)`.
* **Evidence**: `app/api/orders/route.ts:435`.
* **Root Cause**: Fire-and-forget without retry queue.
* **Affected Layers**: Customer Notifications.
* **Severity**: **MEDIUM** (Customers fail to receive confirmation emails with zero alerting).
* **Proposed Fix**: Persist notification records in an outbox table with background retry workers.
* **Regression Test**: `tests/integration/network-resilience.test.ts`.

---

### BUG-11: IDOR & Information Disclosure in Public Order Tracking
* **BUG ID**: BUG-11
* **Reproducible Steps**:
  1. Create an order with an authenticated user (User A).
  2. Send `GET /api/orders/<orderNumber>?view=tracking` without cookies or as User B.
* **Expected Behavior**: Tracking endpoint requires authentication or verification of the matching phone/zip code.
* **Actual Behavior**: Tracking details and destination city are returned to unauthenticated callers.
* **Evidence**: `app/api/orders/[id]/route.ts:84-94` grants access to tracking data if `view === 'tracking'` before rejecting unauthenticated users.
* **Root Cause**: Incomplete authorization gate on tracking view param.
* **Affected Layers**: Orders API.
* **Severity**: **MEDIUM** (Order enumeration and destination city leakage).
* **Proposed Fix**: Require phone number confirmation or guest token before returning tracking data.
* **Regression Test**: `tests/integration/security-negative.test.ts` ("prevents IDOR: unauthorized user cannot access another user's order details").

---

### BUG-12: Missing Payment Amount Verification in Payment Webhook Handler
* **BUG ID**: BUG-12
* **Reproducible Steps**:
  1. Create an order with `grandTotal: 100000` (1000 BDT).
  2. Send a forged or manipulated webhook callback payload containing `amount: 100` (1 BDT) with a valid transaction reference.
* **Expected Behavior**: Webhook handler checks that callback amount equals or exceeds order `grandTotal` before marking order as `PAID`.
* **Actual Behavior**: Handler updates payment and order status to `PAID` without verifying the payload amount against `payment.amount`.
* **Evidence**: `app/api/payments/webhook/[provider]/route.ts:79-102` sets `status: webhookResult.status` without checking amount.
* **Root Cause**: Missing amount validation guard in the webhook transition block.
* **Affected Layers**: Payment Webhooks, Financial Security.
* **Severity**: **CRITICAL** (Financial underpayment vulnerability).
* **Proposed Fix**: Add check: `if (webhookResult.amount && webhookResult.amount < payment.amount) throw new Error("Payment amount mismatch");`.
* **Regression Test**: `tests/integration/security-negative.test.ts` ("rejects webhooks with wrong payment amount").

---

### BUG-13: Missing Replayed Webhook Protection
* **BUG ID**: BUG-13
* **Reproducible Steps**:
  1. Re-post an identical webhook event after an order has already transitioned to `PAID`.
* **Expected Behavior**: Replayed events are deduplicated idempotently.
* **Actual Behavior**: Handler appends redundant status history records and overwrites `webhookAt` timestamps.
* **Evidence**: `app/api/payments/webhook/[provider]/route.ts:80-111`.
* **Root Cause**: Missing state guard checking if payment is already in terminal state (`PAID`).
* **Affected Layers**: Payment Webhooks.
* **Severity**: **LOW** (Audit log pollution).
* **Proposed Fix**: Short-circuit if `payment.status === 'PAID'` and return `200 OK` without database mutation.
* **Regression Test**: `tests/integration/security-negative.test.ts` ("handles replayed webhooks safely").

---

### BUG-14: Missing Request Timeout and Unhandled Network Drop in Image Upload
* **BUG ID**: BUG-14
* **Reproducible Steps**:
  1. Attempt to upload a product image when Cloudinary API is unreachable.
* **Expected Behavior**: Request terminates after a configured timeout (e.g. 10s) with 502/504.
* **Actual Behavior**: Native `fetch` without an `AbortSignal.timeout` hangs up to 60s, and throws unhandled `TypeError: fetch failed`.
* **Evidence**: `app/api/admin/upload/route.ts:65-68`.
* **Root Cause**: Missing `signal: AbortSignal.timeout(10_000)` and missing `try/catch` around `fetch`.
* **Affected Layers**: Admin Upload API.
* **Severity**: **MEDIUM** (Hangs worker processes during upstream outages).
* **Proposed Fix**: Wrap `fetch` in `try/catch` and attach `AbortSignal.timeout(15_000)`.
* **Regression Test**: `tests/integration/network-resilience.test.ts` ("image upload route handles Cloudinary network failure with 502").
