# ELARIS Test Coverage Gaps & Diagnostic Layer

This document details the test coverage gaps identified in the existing ELARIS test suite prior to the diagnostic phase, and documents the newly introduced diagnostic and regression-testing layers.

---

## 1. Initial State Coverage Gaps

Prior to this phase, the application had unit tests covering basic utilities, but critical e-commerce flows lacked integration, concurrency, and security testing:

| Functional Area | Initial Unit Test State | Initial E2E Test State | Diagnostic Gap Identified |
| :--- | :--- | :--- | :--- |
| **Cart Operations** | In-memory calculation only (`tests/unit/cart.test.ts`) | Only navigated to `/cart` URL; never clicked "Add to Cart" | Database cart persistence, stock limits, and concurrent cart creation were completely untested. |
| **Order Creation** | Order number generator only (`tests/unit/order-service.test.ts`) | Visited `/checkout` shell; never submitted form or verified order | Database transactions, inventory reservation, and payment linkage were untested against a real DB. |
| **Inventory** | Mock quantity decrements (`tests/unit/inventory.test.ts`) | None | No concurrent reservation race condition test against real PostgreSQL. |
| **Coupons** | Pure pricing unit math (`tests/unit/pricing.test.ts`) | None | Atomic coupon limit enforcement and concurrent checkout usage limits were untested. |
| **Authentication & RBAC** | Static array checks (`tests/unit/permissions.test.ts`) | Tested login inputs existed | Session creation, cart merge upon login, and route permission enforcement were untested in database. |
| **Payment Persistence** | Mock provider factory (`tests/unit/payments.test.ts`) | None | Real database payment persistence, status transitions, and amount integrity were untested. |
| **Webhooks** | None | None | No negative tests for forged signatures, replayed webhooks, wrong amount, or mismatched providers. |
| **System Health** | None | None | No endpoint existed to monitor database connectivity, build identifier, or migration readiness. |

---

## 2. New Diagnostic & Regression Testing Matrix

During this diagnostic phase, a comprehensive testing layer was built with 14 new test suites containing 48 integration, concurrency, security, and resilience tests running against a dedicated PostgreSQL database:

### A. Core Integration Suites (`tests/integration/`)
1. **`test-db.ts`**: Dedicated PostgreSQL runner (port 15432) with automated schema verification, table cleanup, and entity fixtures.
2. **`cart.test.ts`**:
   - Persists anonymous cart items in PostgreSQL.
   - Enforces stock boundary checks on add-to-cart.
   - Updates item quantities and recalculates line totals.
   - Isolates carts between distinct anonymous sessions.
3. **`order.test.ts`**:
   - Atomic conditional stock reservation in PostgreSQL transaction.
   - Inventory movement audit logging with type `RESERVATION`.
   - Order payment and status history record persistence.
   - Guest order token generation and guest contact persistence.
4. **`inventory.test.ts`**:
   - Conditional inventory reservation using raw SQL row updates.
   - Out-of-stock boundary rejection.
   - Unavailable variant rejection.
   - Inventory release upon order cancellation with type `RELEASE`.
5. **`coupon.test.ts`**:
   - Percentage and fixed amount coupon discounting.
   - Expired coupon rejection.
   - Minimum spend threshold validation.
   - Atomic coupon `usageCount` increment and limit enforcement.
6. **`auth.test.ts`**:
   - Better Auth user and session persistence in PostgreSQL.
   - Anonymous-to-authenticated cart merge on user sign-in.
7. **`rbac.test.ts`**:
   - Distinction between `CUSTOMER` and `ADMIN` roles in database.
   - Role permission validation (`product:manage`, `order:manage`, `offer:manage`, `inventory:manage`).
   - Granular `RolePermission` mapping persistence.
8. **`payment.test.ts`**:
   - Payment record creation for all providers (`COD`, `SSLCOMMERZ`, `BKASH`).
   - Payment status transitions (`PENDING` -> `PAID`).
   - Audit trail for multiple retry attempts per order.
9. **`order-ownership.test.ts`**:
   - Authorized access for order owners.
   - IDOR prevention: non-owners rejected from viewing orders.
   - Guest token validation for unauthenticated guest orders.
   - Admin universal access override.

---

### B. PostgreSQL Concurrency Suites
1. **`concurrency-inventory.test.ts`**:
   - Simulates 10 concurrent checkout requests competing for 2 available units.
   - Proves exactly 2 succeed and 8 fail.
   - Verifies `reservedQuantity` in PostgreSQL never exceeds 2 (no overselling).
2. **`concurrency-coupon.test.ts`**:
   - Simulates 10 concurrent requests for a coupon with `usageLimit = 1`.
   - Proves exactly 1 succeeds and 9 are rejected.
   - Verifies `usageCount` in PostgreSQL never exceeds 1.
3. **`concurrency-cart.test.ts`**:
   - Dispatches 5 concurrent calls to `getOrCreateCart` with identical `anonymousId`.
   - Proves the race condition where duplicate active carts are created due to missing unique constraint.
4. **`concurrency-idempotency.test.ts`**:
   - Dispatches 3 rapid identical order requests.
   - Proves lack of idempotency generates duplicate orders without server-side deduplication.

---

### C. Security & Negative Suites
1. **`security-negative.test.ts`**:
   - **Price Tampering**: Asserts server calculates line totals strictly from database prices.
   - **Shipping Tampering**: Asserts shipping fee is derived server-side from delivery location.
   - **Discount Tampering**: Asserts coupon rules cannot be bypassed by client values.
   - **IDOR**: Verifies cross-user order retrieval attempts are denied.
   - **Forged Webhooks**: Verifies invalid signatures are rejected.
   - **Replayed Webhooks**: Verifies already processed payments do not create duplicate side effects.
   - **Wrong Payment Amount**: Rejects webhooks with amount less than order total.
   - **Wrong Provider**: Rejects webhooks intended for other gateways.
   - **Unauthorized Admin**: Rejects non-admin requests to admin endpoints.

---

### D. Network Resilience & Failure Suites
1. **`network-resilience.test.ts`**:
   - Cart POST client abort / network timeout handling.
   - Checkout handling of payment gateway timeouts (HTTP 502/504).
   - Checkout handling of upstream gateway 500 errors.
   - Database disconnection reporting via application health layer.
   - Image upload handling when Cloudinary connection is refused.
   - Image upload handling when Cloudinary returns HTTP 500.

---

### E. Upgraded E2E Actions (`tests/e2e/`)
1. **`checkout.spec.ts`**:
   - Upgraded from simple page render check to real user shopping actions:
     1. Browsing collection at `/shop`.
     2. Selecting variant size on PDP.
     3. Clicking "Add to Cart" button.
     4. Verifying cart contents.
     5. Filling checkout delivery form (name, email, phone, address, city).
     6. Selecting COD payment method.
     7. Clicking "Place Order" button.
2. **`admin.spec.ts`**:
   - Upgraded to perform user credential entry and assert authentication rejection.
   - Verifies protected route redirection and API authorization gates.

---

### F. Health Monitoring Endpoint
1. **`app/api/health/route.ts`**:
   - Route: `GET /api/health`
   - Non-secret monitoring payload:
     * `status`: "healthy" | "degraded"
     * `build`: package version or build identifier
     * `database`: "connected" | "disconnected"
     * `schema`: "ready" | "pending" | "unavailable"
     * `responseTimeMs`: database ping duration in milliseconds
     * `timestamp`: ISO-8601 current timestamp
