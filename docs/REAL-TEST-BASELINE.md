# ELARIS Real Test Baseline & Execution Matrix

This document establishes the verified baseline of the ELARIS application testing layer executing against a dedicated PostgreSQL cluster (`127.0.0.1:15432`) without test-harness schema patches.

---

## 1. Quality Gates Summary

| Verification Stage | Command Executed | Result | Notes |
| :--- | :--- | :--- | :--- |
| **Clean Install** | `npm ci` | **PASS** | 571 packages installed, Prisma client v7.10.0 generated |
| **Prisma Generation** | `npx prisma generate` | **PASS** | Client generated cleanly |
| **Migration Deployment** | `npx prisma migrate deploy` | **PASS** | 3 committed migrations applied (`20260902165854_init`, `20260902170205_add_account_issuer`, `20260903093835_add_otp_fields`) |
| **Typecheck** | `npm run typecheck` | **PASS** | 0 TypeScript errors across source and test suites |
| **Lint** | `npm run lint` | **PASS** | 0 ESLint errors (13 non-blocking React hook warnings) |
| **Unit Tests** | `npx vitest run tests/unit/` | **PASS** | 27 test files, 130 unit tests passing |
| **Build Validation** | `npm run build` | **PASS** | Next.js production bundle compiles successfully |

---

## 2. Integration & Route Handler Execution Matrix

All integration tests execute against real PostgreSQL and invoke actual Next.js App Router route handlers with real Better Auth sessions and request contexts.

| Test File | Target Route / Layer | Status | Underlying Failure Root Cause |
| :--- | :--- | :--- | :--- |
| **`tests/integration/health.test.ts`** | `GET /api/health` | **PASS** (4/4) | Distinguishes `ready` (200), `failed` (503), `pending` (503), and `disconnected` (503). |
| **`tests/integration/network-resilience.test.ts`** | `POST /api/admin/upload` | **PASS** (4/4) | Verifies timeout (502), connection refused (502), upstream 500 (502), and corrupt body handling. |
| **`tests/integration/inventory.test.ts`** | Inventory transactions | **PASS** (4/4) | Conditional reservation, stock boundaries, and release movements. |
| **`tests/integration/coupon.test.ts`** | Pricing & Coupons | **PASS** (5/5) | Discount calculation, expiration, min spend, atomic usage limits. |
| **`tests/integration/cart.test.ts`** | `GET, POST, PATCH, DELETE /api/cart` | **PASS** (5/5) | DB cart persistence, line item totals, stock constraints. |
| **`tests/integration/concurrency-inventory.test.ts`** | Variant Stock Lock | **PASS** (1/1) | 10 concurrent requests for 2 units: exactly 2 succeed, 8 fail with stock errors. |
| **`tests/integration/concurrency-coupon.test.ts`** | Coupon Limit Lock | **PASS** (1/1) | 10 concurrent requests for 1 single-use coupon: exactly 1 succeeds, 9 fail. |
| **`tests/integration/concurrency-cart.test.ts`** | `GET, POST /api/cart` | **FAIL** (Reproduced BUG-02) | 10 concurrent requests created **5 duplicate active carts** due to non-atomic `findFirst` + `create`. |
| **`tests/integration/concurrency-idempotency.test.ts`** | `POST /api/orders` | **FAIL** (Reproduced BUG-01 & BUG-03) | `tx.order.create()` crashed on missing `Order.guestToken` (BUG-01) and lacks `Idempotency-Key` deduplication (BUG-03). |
| **`tests/integration/order.test.ts`** | Order Lifecycle & Guest Tokens | **FAIL** (Reproduced BUG-01) | `Order.guestToken` column does not exist in the unpatched database schema. |
| **`tests/integration/order-ownership.test.ts`** | Order IDOR & Ownership | **FAIL** (Reproduced BUG-01) | Order lookup attempts to select `Order.guestToken`, crashing with `ColumnNotFound`. |
| **`tests/integration/rbac.test.ts`** | Real 401/403 Matrix across Protected APIs | **15 PASS / 1 FAIL** | 15 security matrix tests pass. 1 test (`PATCH /api/admin/orders/[id]/status`) fails due to missing `Order.guestToken` during order lookup. |
| **`tests/integration/payment.test.ts`** | `POST /api/payments/webhook/:provider` | **2 PASS / 3 FAIL** (Reproduced BUG-12, BUG-14, BUG-01) | Invalid signature correctly rejected (401). Valid webhook fails on `include: { order: true }` (BUG-01). Wrong amount is accepted with 200 (BUG-12). Wrong provider returns 500 (BUG-14). |

---

## 3. Playwright Browser E2E Baseline

| Spec File | User Journey Tested | Baseline Result |
| :--- | :--- | :--- |
| **`tests/e2e/checkout.spec.ts`** | Browse → PDP → Size Selection → Add to Cart → Cart View → Checkout Form Fill → COD Selection → Place Order | **Reproduces BUG-01**: Form submits `POST /api/orders`, server returns HTTP 500 due to unmigrated `Order.guestToken`. When remediated, redirects to `/checkout/success`. |
| **`tests/e2e/checkout.spec.ts`** | Duplicate Submission (Double-Click Place Order) | Verified UI handles rapid submission events without duplicate browser side effects. |
| **`tests/e2e/admin.spec.ts`** | Bad Credential Rejection & Admin Route Locks | **PASS**: Rejects invalid credentials, blocks unauthenticated access to `/admin`, and verifies API route auth guards. |
| **`tests/e2e/admin.spec.ts`** | Complete Admin Lifecycle (Login → Dashboard → Products → Orders → Logout) | Navigates complete administrative workflow with real authentication. |
