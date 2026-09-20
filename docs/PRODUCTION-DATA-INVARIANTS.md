# ELARIS Production Data Invariants & Fallback Audit

This document defines the strict data and operational invariants required for production stability, and provides an exhaustive classification of all fallbacks, mock data, and error handlers discovered across the codebase.

---

## 1. Production Fallback & Error Masking Audit

Every fallback, mock data structure, and catch-and-return block in the codebase is categorized into one of four classifications:
- **DEMO DATA**: Hardcoded mock entities left from early prototyping.
- **VALID EMPTY STATE**: Expected empty responses for unauthenticated callers or blank states.
- **ERROR MASKING**: Catching unexpected exceptions and silently returning default data, blinding monitoring systems.
- **INTENTIONAL FALLBACK**: Documented business logic fallbacks (e.g. shipping zones, development bypasses).

| Location | Pattern / Value | Current Behavior | Classification | Target Production Invariant |
| :--- | :--- | :--- | :--- | :--- |
| **`app/(storefront)/track/page.tsx:9-18`** | `const orderTimeline = [...]` | Hardcoded mock timeline array (Dec 14 - Dec 17, 2024). | **DEMO DATA** | Order tracking must query authoritative `OrderStatusHistory` in PostgreSQL. |
| **`app/(storefront)/track/page.tsx:53-62`** | `ATC-0003`, "Oversized Cotton Tee / M" | Hardcoded sample order displayed in tracking UI. | **DEMO DATA** | Must only render order details when a valid order number is submitted and authorized. |
| **`components/checkout/checkout-shell.tsx:175`** | `ELR-${date}-1842` | Fake fallback order ID generated client-side if API response omits `orderNumber`. | **DEMO DATA** | Client must never generate fake order IDs; require authoritative server `orderNumber`. |
| **`app/(admin)/admin/page.tsx:75-77`** | `catch (err) { console.error("Database fallback activated") }` | Catches DB aggregation errors and sets revenue: 0, customers: 0, orders: 0. | **ERROR MASKING** | Must propagate 500 error to error boundary; never display ৳0 revenue during DB outages. |
| **`app/api/admin/analytics/sales/route.ts:115-124`** | `catch (err) { return points.map(b => ({ revenue: 0, orders: 0 })) }` | Catches DB failures and returns HTTP 200 with fake zero buckets. | **ERROR MASKING** | Must return HTTP 500/503 with error payload during database degradation. |
| **`features/catalog/data.ts:159-170`** | `getAllProducts`: `catch (err) { return []; }` | Returns empty product array with HTTP 200 when DB query fails. | **ERROR MASKING** | Must throw or return structured error so storefront signals database unavailability. |
| **`features/catalog/data.ts:241-257`** | `getProductBySlug`: `catch (err) { return undefined; }` | Masks DB disconnection as "Product Not Found" (HTTP 404). | **ERROR MASKING** | Must distinguish missing product (404) from database query error (500). |
| **`app/api/wishlist/route.ts:11-13`** | `if (!session?.userId) return { items: [] }` | Returns empty array for unauthenticated callers. | **VALID EMPTY STATE** | Guests do not have server-side wishlists; valid empty list. |
| **`app/api/wishlist/route.ts:30, 66`** | `await request.json().catch(() => null)` | Returns null if request body is not valid JSON. | **VALID EMPTY STATE** | Safe JSON parse before schema validation. |
| **`app/api/orders/route.ts:50-57`** | `insideDhaka ? 6000 : 12000` | Unmatched cities default to 12000 paisa (120 BDT). | **INTENTIONAL FALLBACK** | Standard national delivery rate applies to all cities outside Dhaka. |
| **`lib/payments/providers.ts:40-49`** | `if (!secret && NODE_ENV !== "production") return;` | Webhook verification bypassed when secret missing in non-prod. | **INTENTIONAL FALLBACK** | Allows local simulators, but must remain strictly disabled in production. |
| **`app/api/orders/route.ts:423, 435`** | `computeAndStoreRisk(...).catch()`, `sendEmail(...).catch()` | Asynchronous background tasks caught so order response returns fast. | **INTENTIONAL FALLBACK** | Background analytics and email failures must not block order completion. |

---

## 2. Core Operational & Concurrency Invariants

### Invariant 1: Non-Overselling Inventory Reservation
* **Rule**: For any variant $V$, the condition $V.\text{reservedQuantity} + V.\text{stockQuantity} \ge \text{quantity}$ must hold at all times.
* **Mechanism**: Atomic conditional SQL query (`UPDATE "ProductVariant" SET "reservedQuantity" = "reservedQuantity" + $1 WHERE id = $2 AND "stockQuantity" - "reservedQuantity" >= $1`).
* **Proof**: Tested in `tests/integration/concurrency-inventory.test.ts` (10 concurrent requests for 2 available units).

### Invariant 2: Atomic Coupon Usage Limits
* **Rule**: Single-use coupons (`usageLimit = 1`) must never be consumed more than once, even under high concurrency.
* **Mechanism**: Atomic increment with condition (`UPDATE "Coupon" SET "usageCount" = "usageCount" + 1 WHERE id = $1 AND "usageCount" < "usageLimit"`).
* **Proof**: Tested in `tests/integration/concurrency-coupon.test.ts` (10 concurrent checkouts; exactly 1 succeeds).

### Invariant 3: Single Active Cart Identity
* **Rule**: For any `userId` or `anonymousId`, at most ONE cart with `status = 'ACTIVE'` may exist.
* **Violation Discovered (BUG-02)**: 10 concurrent requests created 5 active carts.
* **Required Invariant**: Database partial unique index `CREATE UNIQUE INDEX "Cart_anonymousId_active_key" ON "Cart"("anonymousId") WHERE status = 'ACTIVE'`.

### Invariant 4: Order Submission Idempotency
* **Rule**: Submitting identical checkout requests with the same `Idempotency-Key` header within 24 hours must execute order placement exactly once and return identical responses.
* **Violation Discovered (BUG-03)**: Lacked server-side idempotency storage.
* **Required Invariant**: Persistent `IdempotencyKey` table tracking key, request hash, order ID, and response payload.

### Invariant 5: Payment Amount Integrity
* **Rule**: Inbound payment gateway webhooks must be verified against the exact order grand total. Any webhook reporting an amount less than `Order.grandTotal` must be rejected immediately.
* **Violation Discovered (BUG-12)**: Webhook handler currently ignores reported amount.
